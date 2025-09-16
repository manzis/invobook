// /pages/api/invoices.js (Corrected and Final)

import { verify } from 'jsonwebtoken';
import prisma from '../../lib/prisma';

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { authToken } = req.cookies;
  if (!authToken) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  try {
    const decoded = verify(authToken, SECRET_KEY);
    const userId = decoded.userId;
    const invoiceData = req.body;
    let clientId = invoiceData.clientId;

    // --- Handle New vs. Existing Client ---
    if (!clientId) {
      if (!invoiceData.clientName && !invoiceData.clientCompany) {
        return res.status(400).json({ message: 'New client name and business are required.' });
      }
      const newClient = await prisma.client.create({
        data: {
          name: invoiceData.clientName,
          email: invoiceData.clientEmail,
          company: invoiceData.clientCompany,
          address: invoiceData.clientAddress,
          city: invoiceData.clientCity,
          phone: invoiceData.clientPhone,
          taxId: invoiceData.clientTaxId,
          userId: userId,
        },
      });
      clientId = newClient.id;
    }

    const subtotal = parseFloat(invoiceData.subtotal) || 0;
    const discountType = invoiceData.discountType || 'PERCENTAGE';
    const discountValue = parseFloat(invoiceData.discountValue) || 0;
    const taxRate = parseFloat(invoiceData.taxRate) || 0;
    const shippingCost = parseFloat(invoiceData.shippingCost) || 0;
    const amountPaid = parseFloat(invoiceData.amountPaid) || 0;

    // 2. Perform all financial calculations on the server to ensure data integrity.
    let discountAmount = 0;
    if (discountType === 'PERCENTAGE') {
      discountAmount = subtotal * (discountValue / 100);
    } else { // Assumes 'FIXED'
      discountAmount = discountValue > subtotal ? subtotal : discountValue; // Cap discount at subtotal
    }

    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (taxRate / 100);
    const total = taxableAmount + taxAmount + shippingCost;
    const balanceDue = total - amountPaid;
    

      let finalStatus = invoiceData.status || 'PENDING';

    // Only update status automatically if it's not a draft
    if (finalStatus !== 'DRAFT') {
      if (balanceDue <= 0) {
        // If the balance is zero or less, the invoice is fully PAID.
        finalStatus = 'PAID';
      } else if (amountPaid > 0) {
        // If not fully paid, but some amount has been paid, it's PARTIALLY_PAID.
        finalStatus = 'PARTIALLY_PAID';
      }
      
    }


    // --- Create the Invoice and its Items ---
    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber: invoiceData.invoiceNumber,
        date: new Date(invoiceData.date),
        dueDate: new Date(invoiceData.dueDate),
        status: finalStatus,
        notes: invoiceData.notes,
        terms: invoiceData.terms,
        
        // Use the server-calculated values to prevent data tampering
        subtotal: subtotal,
        discountType: discountType,
        discountValue: discountValue,
        discountAmount: discountAmount,
        taxRate: taxRate,
        taxAmount: taxAmount,
        shippingCost: shippingCost,
        total: total,
        amountPaid: amountPaid,
        balanceDue: balanceDue,
        
        // Link relationships
        userId: userId,
        clientId: clientId,
        
        // Create nested line items
        items: {
          create: invoiceData.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
          })),
        },
      },
      include: {
        items: true,
        client: true,
      },
    });

    return res.status(201).json(newInvoice);

  } catch (error) {
    console.error("Create Invoice API Error:", error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'An invoice with this number already exists.' });
    }
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}