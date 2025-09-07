// /pages/api/invoices/[invoiceId].js

import { verify } from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import prisma from '../../../lib/prisma';
import { generateAndUploadInvoicePDF } from '../../../lib/pdfGenerator'; // Ensure this path is correct

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
  const { invoiceId } = req.query;
  const { authToken } = req.cookies;
  if (!authToken) return res.status(401).json({ message: 'Not authenticated.' });

  try {
    const decoded = verify(authToken, SECRET_KEY);
    const userId = decoded.userId;

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, userId: userId },
    });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found or you do not have permission.' });
    }

    if (req.method === 'DELETE') {
      await prisma.invoice.delete({ where: { id: invoiceId } });
      return res.status(204).end();
    }
    
    else if (req.method === 'PATCH') {
      const { paymentAmount, ...invoiceData } = req.body;

      // --- SCENARIO 1: A payment is being recorded from the menu ---
      if (paymentAmount !== undefined) {
        
        // --- THIS IS THE ADDED LOG ---
        console.log(`[API LOG] Received payment for invoice ${invoiceId}. Amount:`, paymentAmount);
        // --- END OF ADDED LOG ---

        if (isNaN(paymentAmount) || Number(paymentAmount) < 0) {
          return res.status(400).json({ message: 'Invalid payment amount provided.' });
        }

        const newAmountPaid = new Prisma.Decimal(invoice.amountPaid).plus(new Prisma.Decimal(paymentAmount));
        const newBalanceDue = new Prisma.Decimal(invoice.total).minus(newAmountPaid);

        let newStatus = 'PARTIALLY_PAID';
        if (newBalanceDue.isZero() || newBalanceDue.isNegative()) {
          newStatus = 'PAID';
        }

        const updatedInvoice = await prisma.invoice.update({
          where: { id: invoiceId },
          data: {
            amountPaid: newAmountPaid,
            balanceDue: newBalanceDue,
            status: newStatus,
          },
        });
        return res.status(200).json(updatedInvoice);
      }
      
      // --- SCENARIO 2: A full invoice update is being saved from the edit page ---
      else {
        console.log(`[API LOG] Received full invoice update for invoice ${invoiceId}.`);
        const { items, ...mainDetails } = invoiceData;
        const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        // Replace with your full calculation for total
        const total = subtotal; 
        
        const formAmountPaid = parseFloat(mainDetails.amountPaid) || 0;
        const balanceDue = total - formAmountPaid;

        let finalStatus;
        if (mainDetails.status === 'DRAFT' && formAmountPaid === 0) {
          finalStatus = 'DRAFT';
        } else if (balanceDue <= 0) {
          finalStatus = 'PAID';
        } else if (formAmountPaid > 0 && balanceDue > 0) {
          finalStatus = 'PARTIALLY_PAID';
        } else {
          finalStatus = new Date(mainDetails.dueDate) < new Date() ? 'OVERDUE' : 'PENDING';
        }
        
        const updatedInvoice = await prisma.$transaction(async (tx) => {
            await tx.invoiceItem.deleteMany({ where: { invoiceId: invoiceId } });
            return await tx.invoice.update({
                where: { id: invoiceId },
                data: {
                    ...mainDetails, // Spread the rest of the details
                    subtotal,
                    total,
                    amountPaid: formAmountPaid,
                    balanceDue: balanceDue,
                    status: finalStatus,
                    items: {
                      create: items.map(item => ({
                        description: item.description,
                        quantity: parseFloat(item.quantity) || 1,
                        rate: parseFloat(item.rate) || 0,
                        amount: parseFloat(item.amount) || 0,
                      })),
                    },
                }
            });
        });

        

        // Regenerate PDF and return
        const newPdfUrl = await generateAndUploadInvoicePDF(updatedInvoice.id);
        const finalInvoiceWithPdf = await prisma.invoice.update({
          where: { id: updatedInvoice.id },
          data: { pdfUrl: newPdfUrl },
          include: { items: true, client: true },
        });

        return res.status(200).json(finalInvoiceWithPdf);
      }
    }

    res.setHeader('Allow', ['DELETE', 'PATCH']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
    
  } catch (error) {
    console.error(`API Error for invoice ${invoiceId}:`, error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}