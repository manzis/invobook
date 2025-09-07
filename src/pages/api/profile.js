import { verify } from 'jsonwebtoken';
import prisma from '../../lib/prisma';

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
  const { authToken } = req.cookies;

  // 1. Authenticate the user
  if (!authToken) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  try {
    const decoded = verify(authToken, SECRET_KEY);
    const userId = decoded.userId;

    // --- HANDLE GET REQUEST: Fetch full user and business profile ---
    if (req.method === 'GET') {
      const userProfile = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          business: true, // Include the related business data
        },
      });

      if (!userProfile) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const { hashedPassword, ...profileData } = userProfile;
      return res.status(200).json(profileData);
    }
    
    // --- HANDLE PUT REQUEST: Update user and business profile ---
    else if (req.method === 'PUT') {
      // Destructure all expected fields, including the new ones
      const { name, phone, company, address, city, state, zipCode, website, taxId, logoUrl } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          business: {
            update: {
              businessName: company,
              phone: phone || null,
              logoUrl: logoUrl,
              address: address || null,
              city: city || null,
              state: state || null,       // <-- ADDED
              zipCode: zipCode || null,   // <-- ADDED
              website: website || null,
              taxId: taxId || null,
            },
          },
        },
        include: {
          business: true,
        },
      });
      
      const { hashedPassword, ...profileData } = updatedUser;
      return res.status(200).json({ message: 'Profile updated successfully', profile: profileData });
    }
    // Handle other methods
    else {
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

  } catch (error) {
    console.error("Profile API Error:", error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}