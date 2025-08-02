// /pages/api/auth/login.js

import { sign } from 'jsonwebtoken';
import { serialize } from 'cookie';
import prisma from '../../../lib/prisma'
import bcrypt from 'bcrypt';

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { email, password } = req.body;

    // --- Find User in Database ---
    const user = await prisma.user.findUnique({ where: { email } });

    // If no user found OR if password does not match, return a generic error.
    // This prevents attackers from knowing which emails are registered.
    if (!user || !(await bcrypt.compare(password, user.hashedPassword))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // --- User is Valid, Create Login Session ---
    const userPayload = { userId: user.id, email: user.email, name: user.name };
    const token = sign(userPayload, SECRET_KEY, { expiresIn: '7d' });
    const serializedCookie = serialize('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    res.setHeader('Set-Cookie', serializedCookie);
    return res.status(200).json({ message: 'Login successful', user: userPayload });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}