// /pages/api/invoices.js (Updated with automatic status updates)

import { verify } from 'jsonwebtoken';
import prisma from '../../lib/prisma';

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
  const { authToken } = req.cookies;
  if (!authToken) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  try {
    const decoded = verify(authToken, SECRET_KEY);
    const userId = decoded.userId;

    // --- HANDLE GET REQUEST to fetch all invoices ---
    if (req.method === 'GET') {
      
      // --- NEW LOGIC: Automatically update overdue invoices ---
      const now = new Date();
      
      // Find all invoices for this user that are currently 'PENDING'
      // and whose dueDate has passed.
      await prisma.invoice.updateMany({
    where: {
      userId: userId,
      
      // THIS IS THE KEY CONDITION:
      // It ONLY looks for invoices that are currently 'PENDING'.
      // It will completely ignore any invoices that are 'PAID', 'DRAFT', or already 'OVERDUE'.
      status: 'PENDING', 
      
      dueDate: {
        lt: now, // And whose due date is in the past
      },
    },
    // It updates their status to 'OVERDUE'
    data: {
      status: 'OVERDUE',
    },
  });
      // --- END OF NEW LOGIC ---

      // Now, fetch all invoices for the user (including the ones we just updated)
      const invoices = await prisma.invoice.findMany({
        where: { userId: userId },
        include: {
          client: { select: { name: true } },
          items: { select: { id: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Safely serialize the response to handle Prisma's Decimal type
      return res.status(200).json(JSON.parse(JSON.stringify(invoices)));
    }
    
    // --- HANDLE POST REQUEST for creating invoices ---
    else if (req.method === 'POST') {
      const invoiceData = req.body;
      // ... Your full create invoice logic is here ...
      // This part remains unchanged
      let clientId = invoiceData.clientId;
      if (!clientId) {
        // ... new client creation logic ...
      }
      // ... server-side calculations ...
      const newInvoice = await prisma.invoice.create({ /* ... */ });
      return res.status(201).json(newInvoice);
    }

    // Handle other methods
    else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

  } catch (error) {
    console.error("Invoices API Error:", error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}