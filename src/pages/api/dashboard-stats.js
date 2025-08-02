// pages/api/dashboard-stats.js

import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET;

// --- Helper Functions (No changes needed here) ---
const formatPercentageChange = (change) => {
    const formatted = change.toFixed(1);
    if (change > 0) return `+${formatted}%`;
    return `${formatted}%`;
};
const formatCountChange = (change) => {
    if (change > 0) return `+${change}`;
    return change.toString();
};
const getTrend = (change) => {
    if (change > 0) return 'up';
    if (change < 0) return 'down';
    return 'neutral';
};
const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100.0 : 0;
    return ((current - previous) / previous) * 100;
};


export default async function handle(req, res) {
  // --- Authentication ---
  const { authToken } = req.cookies;
  if (!authToken) return res.status(401).json({ message: 'Authentication required.' });
  
  let userId;
  try {
    const decoded = verify(authToken, SECRET_KEY);
    userId = decoded.userId;
    if (!userId) throw new Error('Invalid token payload.');
  } catch (error) {
    return res.status(401).json({ message: 'Your session is invalid or has expired.' });
  }

  // --- Main API Logic ---
  if (req.method === 'GET') {
    try {
      // --- Time Period Definitions ---
      const now = new Date();
      const current30DayStart = new Date(new Date().setDate(now.getDate() - 30));
      const previous30DayStart = new Date(new Date().setDate(now.getDate() - 60));
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      
      // We need to fetch data for trend analysis first
      const fetchStartDateForTrends = previous30DayStart < lastMonthStart ? previous30DayStart : lastMonthStart;

      // --- Query 1: Get Lifetime Total Revenue (Efficiently) ---
      const lifetimeRevenueResult = await prisma.invoice.aggregate({
        where: {
          userId: userId,
          status: 'PAID',
        },
        _sum: {
          total: true,
        },
      });
      const lifetimeRevenue = lifetimeRevenueResult._sum.total || 0;

      // --- Query 2: Get Invoices for Trend/Period-based Calculations ---
      const invoicesForTrends = await prisma.invoice.findMany({
        where: { 
            userId: userId, 
            status: { in: ['PAID', 'PENDING', 'OVERDUE'] }, 
            date: { gte: fetchStartDateForTrends } 
        },
        select: { status: true, total: true, date: true },
      });

      // --- Initialize Counters ---
      let pendingLast30Days = 0, pending30To60DaysAgo = 0;
      let overdueLast30Days = 0, overdue30To60DaysAgo = 0;
      let revenueThisCalendarMonth = 0, revenueLastCalendarMonth = 0;

      // --- Process Invoices for Trend Calculations ---
      for (const inv of invoicesForTrends) {
        const totalAmount = parseFloat(inv.total || 0);
        const invoiceDate = new Date(inv.date); 
        
        // Bucket for Pending/Overdue trends
        if (invoiceDate >= current30DayStart) {
            if (inv.status === 'PENDING') pendingLast30Days++;
            if (inv.status === 'OVERDUE') overdueLast30Days++;
        } else if (invoiceDate >= previous30DayStart) {
            if (inv.status === 'PENDING') pending30To60DaysAgo++;
            if (inv.status === 'OVERDUE') overdue30To60DaysAgo++;
        }

        // Bucket for comparing This Month vs Last Month revenue
        if (invoiceDate >= thisMonthStart) {
            if (inv.status === 'PAID') revenueThisCalendarMonth += totalAmount;
        } else if (invoiceDate >= lastMonthStart && invoiceDate <= lastMonthEnd) {
            if (inv.status === 'PAID') revenueLastCalendarMonth += totalAmount;
        }
      }

      // --- Final Calculations ---
      const pendingChange = calculatePercentageChange(pendingLast30Days, pending30To60DaysAgo);
      const overdueChange = overdueLast30Days - overdue30To60DaysAgo;
      // The change for the "Total Revenue" card is THIS month vs LAST month
      const revenueMonthVsMonthChange = calculatePercentageChange(revenueThisCalendarMonth, revenueLastCalendarMonth);

      // --- Construct the Final JSON Response ---
      const stats = {
        totalRevenue: {
          // The VALUE is now the true lifetime total
          value: parseFloat(lifetimeRevenue).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
          // The CHANGE compares this calendar month to the last calendar month
          change: formatPercentageChange(revenueMonthVsMonthChange),
          trend: getTrend(revenueMonthVsMonthChange),
        },
        pendingInvoices: {
          value: pendingLast30Days.toString(),
          change: formatPercentageChange(pendingChange),
          trend: getTrend(pendingChange),
        },
        overdueInvoices: {
          value: overdueLast30Days.toString(),
          change: formatCountChange(overdueChange),
          trend: getTrend(overdueChange),
        },
        // We will repurpose the 4th card to show this month's revenue clearly
        revenueThisMonth: {
          value: revenueThisCalendarMonth.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
          // The change here also compares to last month, making it consistent
          change: formatPercentageChange(revenueMonthVsMonthChange),
          trend: getTrend(revenueMonthVsMonthChange),
        },
      };

      return res.status(200).json(stats);

    } catch (error) {
      console.error("Error calculating dashboard stats:", error);
      return res.status(500).json({ message: 'An internal server error occurred.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}