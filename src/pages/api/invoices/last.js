// /pages/api/invoices/last.js

import { verify } from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { authToken } = req.cookies;
  if (!authToken) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  try {
    const decoded = verify(authToken, SECRET_KEY);
    const userId = decoded.userId;

    // Find the single most recently created invoice for this user
    const lastInvoice = await prisma.invoice.findFirst({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc', // This is the key to getting the latest one
      },
    });

    // It's perfectly normal for this to be null if it's their first invoice.
    // We return 200 OK with the result, which can be the invoice object or null.
    return res.status(200).json(lastInvoice);

  } catch (error) {
    console.error('API Error fetching last invoice:', error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}