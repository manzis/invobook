// /pages/api/invoices/bulk-actions.js

import { verify } from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

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

    // Get the list of invoice IDs and the action to perform from the request body
    const { invoiceIds, action } = req.body;

    if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      return res.status(400).json({ message: 'An array of invoiceIds is required.' });
    }
    if (!action) {
      return res.status(400).json({ message: 'An action is required.' });
    }

    // --- SECURITY CHECK ---
    // Ensure that all of the invoices to be modified actually belong to the logged-in user.
    const count = await prisma.invoice.count({
      where: {
        id: { in: invoiceIds },
        userId: userId,
      },
    });

    if (count !== invoiceIds.length) {
      return res.status(403).json({ message: 'Forbidden: You are attempting to modify invoices that do not belong to you.' });
    }
    // --- END SECURITY CHECK ---

    let result;
    switch (action) {
      case 'DELETE':
        result = await prisma.invoice.deleteMany({
          where: {
            id: { in: invoiceIds },
          },
        });
        break;

      case 'MARK_PAID':
        result = await prisma.invoice.updateMany({
          where: {
            id: { in: invoiceIds },
          },
          data: {
            status: 'PAID',
            // You could also update balanceDue to 0 here if desired
            balanceDue: 0,
          },
        });
        break;
        
      case 'MARK_PENDING':
        result = await prisma.invoice.updateMany({
          where: {
            id: { in: invoiceIds },
          },
          data: {
            status: 'PENDING',
          },
        });
        break;

      default:
        return res.status(400).json({ message: 'Invalid action specified.' });
    }

    return res.status(200).json({ message: `Successfully performed action: ${action}`, count: result.count });

  } catch (error) {
    console.error("Bulk Invoices API Error:", error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}