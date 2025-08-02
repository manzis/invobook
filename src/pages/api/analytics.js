// /pages/api/analytics.js (Corrected and Final)

import { verify } from 'jsonwebtoken';
import prisma from '../../lib/prisma';

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { authToken } = req.cookies;
  if (!authToken) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  try {
    const decoded = verify(authToken, SECRET_KEY);
    const userId = decoded.userId;

    const { timeRange = '30d' } = req.query;
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case '7d': startDate = new Date(new Date().setDate(now.getDate() - 7)); break;
      case '90d': startDate = new Date(new Date().setDate(now.getDate() - 90)); break;
      case '1y': startDate = new Date(new Date().setFullYear(now.getFullYear() - 1)); break;
      default: startDate = new Date(new Date().setDate(now.getDate() - 30)); break;
    }

    // Fetch all relevant invoices for the user within the date range
    const invoices = await prisma.invoice.findMany({
      where: {
        userId: userId,
        createdAt: { gte: startDate },
      },
      include: { client: { select: { name: true } } },
    });

    const paidInvoices = invoices.filter(inv => inv.status === 'PAID');

    // --- 1. Calculate Key Metrics ---
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0);
    const totalInvoices = invoices.length;
    const avgInvoiceValue = paidInvoices.length > 0 ? totalRevenue / paidInvoices.length : 0;
    const activeClients = [...new Set(invoices.map(inv => inv.clientId))].length;

    // --- 2. Calculate Invoice Status Overview ---
    const statusData = invoices.reduce((acc, inv) => {
      const status = inv.status;
      if (!acc[status]) acc[status] = { count: 0, amount: 0 };
      acc[status].count += 1;
      acc[status].amount += parseFloat(inv.total); // Summing total for all statuses
      return acc;
    }, {});

    // --- 3. Calculate Top Clients (based on paid invoices) ---
    const clientRevenue = paidInvoices.reduce((acc, inv) => {
      const clientName = inv.client.name;
      if (!acc[clientName]) acc[clientName] = 0;
      acc[clientName] += parseFloat(inv.total);
      return acc;
    }, {});

    const topClientsRaw = Object.entries(clientRevenue).sort(([, a], [, b]) => b - a);
    let topClients = topClientsRaw.slice(0, 4).map(([name, revenue]) => ({ name, revenue, percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0 }));
    if (topClientsRaw.length > 4) {
      const othersRevenue = topClientsRaw.slice(4).reduce((sum, [, revenue]) => sum + revenue, 0);
      topClients.push({ name: 'Others', revenue: othersRevenue, percentage: totalRevenue > 0 ? (othersRevenue / totalRevenue) * 100 : 0 });
    }

    // --- 4. THIS IS THE MISSING/FIXED PART: Calculate Monthly Revenue Trend ---
    const monthlyData = paidInvoices.reduce((acc, inv) => {
      // Create a 'YYYY-MM' key for grouping (e.g., "2025-07")
      const monthKey = new Date(inv.date).toISOString().slice(0, 7);
      if (!acc[monthKey]) {
        acc[monthKey] = { revenue: 0, invoices: 0 };
      }
      acc[monthKey].revenue += parseFloat(inv.total);
      acc[monthKey].invoices += 1;
      return acc;
    }, {});

    // Convert the aggregated object into the array format the frontend expects
    const revenueData = Object.entries(monthlyData)
      .map(([key, value]) => {
        const monthDate = new Date(`${key}-01T12:00:00Z`);
        const monthName = monthDate.toLocaleString('default', { month: 'short' });
        return {
          month: monthName,
          revenue: value.revenue,
          invoices: value.invoices,
          sortKey: key,
        };
      })
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey)); 
    
    // --- 5. Assemble Final Payload ---
    const analyticsData = {
      keyMetrics: { totalRevenue, totalInvoices, activeClients, avgInvoiceValue },
      statusData: {
        PAID: statusData.PAID || { count: 0, amount: 0 },
        PENDING: statusData.PENDING || { count: 0, amount: 0 },
        OVERDUE: statusData.OVERDUE || { count: 0, amount: 0 },
        DRAFT: statusData.DRAFT || { count: 0, amount: 0 },
      },
      revenueData, 
      topClients,
    };

    return res.status(200).json(analyticsData);
  } catch (error) {
    console.error("Analytics API Error:", error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}