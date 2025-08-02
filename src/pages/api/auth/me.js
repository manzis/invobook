// /pages/api/auth/me.js
import { verify } from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

const SECRET_KEY = process.env.JWT_SECRET || 'your-super-secret-key-for-pages-router';

export default async function handler(req, res) {
  const { authToken } = req.cookies;

  if (!authToken) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const decoded = verify(authToken, SECRET_KEY);
    // You can add logic here to re-fetch user from DB if needed
    return res.status(200).json({ email: decoded.email, name: decoded.name });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}