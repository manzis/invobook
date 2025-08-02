// /pages/api/clients/[clientId].js (Final version with invoice check)

import { verify } from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
  const { clientId } = req.query;
  const { authToken } = req.cookies;
  if (!authToken) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  try {
    const decoded = verify(authToken, SECRET_KEY);
    const userId = decoded.userId;
    
    // --- HANDLE DELETE REQUEST ---
    if (req.method === 'DELETE') {
      // First, verify this client actually belongs to the logged-in user
      const client = await prisma.client.findFirst({
        where: { id: clientId, userId: userId },
      });

      if (!client) {
        return res.status(404).json({ message: 'Client not found or you do not have permission.' });
      }

      // --- NEW: Check for associated invoices before deleting ---
      const invoiceCount = await prisma.invoice.count({
        where: {
          clientId: clientId,
        },
      });

      // If invoices are found, prevent deletion and return a specific error
      if (invoiceCount > 0) {
        // HTTP 409 Conflict is the appropriate status code here
        return res.status(409).json({
          message: 'This client cannot be deleted because they are associated with existing invoices.',
        });
      }
      
      // --- If no invoices are found, proceed with deletion ---
      await prisma.client.delete({
        where: { id: clientId },
      });
      
      return res.status(204).end(); // 204 No Content is standard for a successful delete
    }
    
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
    
  } catch (error) {
    console.error(`API Error for client ${clientId}:`, error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}