// /pages/api/auth/register.js (Corrected and Final)

import { sign } from 'jsonwebtoken';
import { serialize } from 'cookie';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcrypt';

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {

    
    const { 
        name, email, password, // From SignupForm
        businessName, businessType, address, city, state, zipCode, country, phone, website, taxId // From BusinessDetailsForm
    } = req.body;

    // --- 2. Validation ---
    if (!name || !email || !password || !businessName || !businessType) {
      return res.status(400).json({ message: 'Missing required user or business fields.' });
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // --- 3. Securely Hash Password ---
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- 4. Create User and Business in a single, safe transaction ---
    //    We explicitly map each field to the database schema.
    //    This is safer than spreading an unknown object (...businessDetails).
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        business: {
          create: {
            businessName,
            businessType,
            address: address || null, // Use the value, or null if it's empty
            city: city || null,
            state: state || null,
            zipCode: zipCode || null,
            country: country || null,
            phone: phone || null,
            website: website || null,
            taxId: taxId || null,
          },
        },
      },
      // Include the created business details in the response
      include: {
        business: true,
      },
    });

    // --- 5. Create Login Session ---
    const userPayload = { userId: user.id, email: user.email, name: user.name };
    const token = sign(userPayload, SECRET_KEY, { expiresIn: '7d' });
    const serializedCookie = serialize('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    res.setHeader('Set-Cookie', serializedCookie);
    return res.status(201).json({ message: 'Registration successful', user: userPayload });

  } catch (error) {
    // This will catch Prisma errors, like if a required field is missing.
    console.error("Registration Error:", error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}