// /pages/api/invoices/[invoiceId].js

import { verify } from 'jsonwebtoken';
import prisma from '../../../lib/prisma'; // Adjust path if your lib is in src/

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
  const { invoiceId } = req.query; // Get the specific invoice's ID from the URL
  const { authToken } = req.cookies;

  if (!authToken) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  try {
    const decoded = verify(authToken, SECRET_KEY);
    const userId = decoded.userId;

    // --- SECURITY CHECK: Before any action, verify this invoice belongs to the logged-in user ---
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId: userId, // This is the crucial part
      },
    });

    // If no invoice is found, it either doesn't exist or doesn't belong to this user.
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found or you do not have permission.' });
    }

    // --- HANDLE DELETE REQUEST ---
    if (req.method === 'DELETE') {
      await prisma.invoice.delete({
        where: { id: invoiceId },
      });
      return res.status(204).end(); // 204 No Content is standard for a successful DELETE
    }
    
    // --- HANDLE PATCH REQUEST (for partial updates like changing status) ---
    else if (req.method === 'PATCH') {
      const { status } = req.body; // Get the new status from the request body

      if (!status || !['DRAFT', 'PENDING', 'PAID', 'OVERDUE'].includes(status)) {
        return res.status(400).json({ message: 'Invalid or missing status provided.' });
      }

      const updatedInvoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: status,
          // If marking as paid, you could also set amountPaid to total and balanceDue to 0
          ...(status === 'PAID' && {
            amountPaid: invoice.total,
            balanceDue: 0,
          }),
        },
      });

      return res.status(200).json(updatedInvoice);
    }
    
    // --- HANDLE PUT REQUEST (for full updates, like editing the whole invoice) ---
    else if (req.method === 'PUT') {
        // You can implement the full edit logic here later.
        // It would be similar to the create logic but using `prisma.invoice.update`.
        return res.status(501).json({ message: 'Edit functionality not yet implemented.' });
    }

    // Handle other methods
    res.setHeader('Allow', ['DELETE', 'PATCH', 'PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
    
  } catch (error) {
    console.error(`API Error for invoice ${invoiceId}:`, error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}