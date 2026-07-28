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

    const count = await prisma.payment.count({
      where: {
        status: 'pending',
        invoice: {
          userId: userId,
        },
      },
    });

    return res.status(200).json({ count });
  } catch (error) {
    console.error('Pending payments count API error:', error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}
