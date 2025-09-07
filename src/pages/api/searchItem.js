// /src/pages/api/searchItem.js (Corrected for SQLite)

import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
  const { authToken } = req.cookies;

  if (!authToken) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  try {
    const decoded = verify(authToken, SECRET_KEY);
    const userId = decoded.userId;

    if (req.method === 'GET') {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
      }

      // --- 1. MODIFIED PRISMA QUERY ---
      // Fetch items that contain the query string. This will be CASE-SENSITIVE
      // because SQLite doesn't support the 'insensitive' mode flag.
      const items = await prisma.invoiceItem.findMany({
        where: {
          description: {
            contains: query, // <-- The 'mode: "insensitive"' property has been removed.
          },
          invoice: {
            userId: userId,
          },
        },
        select: {
          description: true,
          rate: true,
        },
        take: 50, // Fetch a broad set of potential matches
      });

      // --- 2. IN-MEMORY FILTERING FOR CASE-INSENSITIVITY & UNIQUENESS ---
      // Now, we will filter this larger list in our code to get the exact results we want.
      const lowercasedQuery = query.toLowerCase();
      const seenDescriptions = new Set();
      
      const uniqueFilteredItems = items
        .filter(item => {
          const lowercasedDesc = item.description.toLowerCase();
          
          // Condition 1: Check for a case-insensitive match
          // Condition 2: Check if we haven't already added this unique description
          if (lowercasedDesc.includes(lowercasedQuery) && !seenDescriptions.has(lowercasedDesc)) {
            seenDescriptions.add(lowercasedDesc);
            return true; // Keep this item
          }
          return false; // Discard this item
        })
        .slice(0, 10); // Finally, take the first 10 unique results

      return res.status(200).json(uniqueFilteredItems);

    } else {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }
    console.error('Search API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}