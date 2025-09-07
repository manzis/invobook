// /pages/api/invoices/[invoiceId].js

import { verify } from 'jsonwebtoken';
import prisma from '../../../lib/prisma';
import { generateAndUploadInvoicePDF } from '../../../lib/pdfGenerator'; // Assuming this helper exists

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
  const { invoiceId } = req.query;
  const { authToken } = req.cookies;
  if (!authToken) return res.status(401).json({ message: 'Not authenticated.' });

  try {
    const decoded = verify(authToken, SECRET_KEY);
    const userId = decoded.userId;

    // Authorization check
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, userId: userId },
    });
    if (!invoice && req.method !== 'POST') { // Allow POST for creation
      return res.status(404).json({ message: 'Invoice not found or you do not have permission.' });
    }

    // --- HANDLE GET REQUEST ---
    if (req.method === 'GET') {
      const fullInvoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { client: true, items: true },
      });
      // Use JSON stringify/parse to handle Decimal objects for serialization
      return res.status(200).json(JSON.parse(JSON.stringify(fullInvoice)));
    }
    
    // --- PUT REQUEST (Update invoice and regenerate PDF) ---
    else if (req.method === 'PUT') {
      const invoiceData = req.body;
      let clientId = invoiceData.clientId;

      // --- 1. FIND OR CREATE THE CLIENT ---
      if (!clientId) {
        if (!invoiceData.clientName && !invoiceData.clientCompany) {
          return res.status(400).json({ message: 'New client name or Business Name are required.' });
        }
        const newClient = await prisma.client.create({
          data: { /* ... client data ... */ userId: userId },
        });
        clientId = newClient.id;
      }

      // --- 2. PERFORM SERVER-SIDE CALCULATIONS ---
      const { items, ...mainInvoiceDetails } = invoiceData;
      const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
      const discountValue = parseFloat(mainInvoiceDetails.discountValue) || 0;
      const taxRate = parseFloat(mainInvoiceDetails.taxRate) || 0;
      const shippingCost = parseFloat(mainInvoiceDetails.shippingCost) || 0;
      const amountPaid = parseFloat(mainInvoiceDetails.amountPaid) || 0;
      let discountAmount = 0;
      if (mainInvoiceDetails.discountType === 'PERCENTAGE') {
        discountAmount = subtotal * (discountValue / 100);
      } else {
        discountAmount = discountValue;
      }
      const taxableAmount = subtotal - discountAmount;
      const taxAmount = taxableAmount * (taxRate / 100);
      const total = taxableAmount + taxAmount + shippingCost;
      const balanceDue = total - amountPaid;

      // --- CORRECTED STATUS CALCULATION LOGIC ---
      let finalStatus;
      // If the user explicitly saves as a DRAFT, respect it.
      if (mainInvoiceDetails.status === 'DRAFT' && amountPaid === 0) {
        finalStatus = 'DRAFT';
      } else if (balanceDue <= 0) {
        finalStatus = 'PAID'; // Paid in full
      } else if (amountPaid > 0 && balanceDue > 0) {
        finalStatus = 'PARTIALLY_PAID'; // Partially paid
      } else {
        // Unpaid, so it's either PENDING or OVERDUE
        finalStatus = new Date(mainInvoiceDetails.dueDate) < new Date() ? 'OVERDUE' : 'PENDING';
      }
      
      // --- 3. UPDATE THE INVOICE DATA IN A TRANSACTION ---
      const updatedInvoice = await prisma.$transaction(async (tx) => {
        await tx.invoiceItem.deleteMany({ where: { invoiceId: invoiceId } });
        
        return await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            invoiceNumber: mainInvoiceDetails.invoiceNumber,
            date: new Date(mainInvoiceDetails.date),
            dueDate: new Date(mainInvoiceDetails.dueDate),
            status: finalStatus, // Use the newly calculated status
            notes: mainInvoiceDetails.notes,
            terms: mainInvoiceDetails.terms,
            subtotal, discountType: mainInvoiceDetails.discountType,
            discountValue, discountAmount, taxRate, taxAmount,
            shippingCost, total, amountPaid, balanceDue,
            client: { connect: { id: clientId } },
            items: {
              create: items.map(item => ({
                description: item.description,
                quantity: parseFloat(item.quantity) || 1,
                rate: parseFloat(item.rate) || 0,
                amount: parseFloat(item.amount) || 0,
              })),
            },
          },
        });
      });
      
      // --- 4. REGENERATE THE PDF ---
      const newPdfUrl = await generateAndUploadInvoicePDF(updatedInvoice.id);

      // --- 5. SAVE THE NEW PDF URL ---
      const finalInvoiceWithPdf = await prisma.invoice.update({
        where: { id: updatedInvoice.id },
        data: { pdfUrl: newPdfUrl },
        include: { items: true, client: true },
      });

      // --- 6. RETURN THE FULLY UPDATED INVOICE ---
      return res.status(200).json(finalInvoiceWithPdf);
    }
    
    // --- HANDLE DELETE REQUEST ---
    else if (req.method === 'DELETE') {
      await prisma.invoice.delete({ where: { id: invoiceId } });
      return res.status(204).end();
    }
    
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
    
  } catch (error) {
    console.error(`API Error for invoice ${invoiceId}:`, error);
    if (error.message.includes('PDF')) {
        return res.status(500).json({ message: 'Invoice updated, but failed to regenerate PDF.' });
    }
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}