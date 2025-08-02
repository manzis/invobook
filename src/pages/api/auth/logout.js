// /pages/api/auth/logout.js
import { serialize } from 'cookie';

export default async function handler(req, res) {
  const serializedCookie = serialize('authToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: -1, // Expire immediately
    path: '/',
  });

  res.setHeader('Set-Cookie', serializedCookie);
  res.status(200).json({ message: 'Logout successful' });
}