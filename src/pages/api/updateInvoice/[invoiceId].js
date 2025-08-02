// /pages/api/invoices/[invoiceId].js (Final version with automatic PDF regeneration)

import { verify } from 'jsonwebtoken';
import prisma from '../../../lib/prisma';
// --- NEW ---
// Import the centralized PDF generation function
import { generateAndUploadInvoicePDF } from '../../../lib/pdfGenerator';

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
  const { invoiceId } = req.query;
  const { authToken } = req.cookies;
  if (!authToken) return res.status(401).json({ message: 'Not authenticated.' });

  try {
    const decoded = verify(authToken, SECRET_KEY);
    const userId = decoded.userId;

    // Authorization check: Does the invoice belong to the user?
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, userId: userId },
    });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found or you do not have permission.' });
    }

    // --- HANDLE GET REQUEST (No changes needed) ---
    if (req.method === 'GET') {
      const fullInvoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { client: true, items: true },
      });
      return res.status(200).json(JSON.parse(JSON.stringify(fullInvoice)));
    }
    
    // --- PUT REQUEST (Update invoice and regenerate PDF) ---
    else if (req.method === 'PUT') {
      const invoiceData = req.body;
      let clientId = invoiceData.clientId;

      // --- 1. FIND OR CREATE THE CLIENT ---
      if (!clientId) {
        if (!invoiceData.clientName || !invoiceData.clientEmail) {
          return res.status(400).json({ message: 'New client name and email are required.' });
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
      let finalStatus = mainInvoiceDetails.status;
      if (finalStatus !== 'PAID' && balanceDue <= 0) {
        finalStatus = 'PAID';
      } else if (finalStatus === 'PAID' && balanceDue > 0) {
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
            status: finalStatus,
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
      
      // --- NEW: 4. REGENERATE THE PDF ---
      // After the database is successfully updated, we call our helper function.
      const newPdfUrl = await generateAndUploadInvoicePDF(updatedInvoice.id);

      // --- NEW: 5. SAVE THE NEW PDF URL ---
      // We perform one last quick update to store the new URL.
      const finalInvoiceWithPdf = await prisma.invoice.update({
        where: { id: updatedInvoice.id },
        data: { pdfUrl: newPdfUrl },
        include: { items: true, client: true }, // Include relations for a complete response
      });

      // --- NEW: 6. RETURN THE FULLY UPDATED INVOICE ---
      return res.status(200).json(finalInvoiceWithPdf);
    }
    
    // --- HANDLE DELETE REQUEST (No changes needed) ---
    else if (req.method === 'DELETE') {
      await prisma.invoice.delete({ where: { id: invoiceId } });
      return res.status(204).end();
    }
    
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
    
  } catch (error) {
    console.error(`API Error for invoice ${invoiceId}:`, error);
    // This provides a more graceful failure if the PDF part fails.
    if (error.message.includes('PDF')) {
        return res.status(500).json({ message: 'The invoice was updated, but we failed to regenerate the PDF file. Please try downloading it manually.' });
    }
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}