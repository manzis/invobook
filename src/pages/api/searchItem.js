// /src/pages/api/searchItem.js
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

    if (req.method === 'GET') {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
      }

      // Check if user has inventory enabled
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { inventoryEnabled: true },
      });

      // --- INVENTORY MODE: Search from InventoryItem table ---
      if (user?.inventoryEnabled) {
        const items = await prisma.inventoryItem.findMany({
          where: {
            userId,
            isActive: true,
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { sku: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
          select: {
            id: true,
            name: true,
            description: true,
            sku: true,
            rate: true,
            purchasePrice: true,
            quantity: true,
            unit: true,
          },
          take: 10,
          orderBy: { name: 'asc' },
        });

        // Map to consistent shape with extra inventory fields
        const results = items.map(item => ({
          inventoryItemId: item.id,
          description: item.name + (item.description ? ` - ${item.description}` : ''),
          rate: item.rate,
          purchasePrice: item.purchasePrice,
          quantity: item.quantity,
          unit: item.unit,
          sku: item.sku,
          isInventory: true,
        }));

        return res.status(200).json(JSON.parse(JSON.stringify(results)));
      }

      // --- LEGACY MODE: Search from past InvoiceItem records ---
      const items = await prisma.invoiceItem.findMany({
        where: {
          description: {
            contains: query,
          },
          invoice: {
            userId: userId,
          },
        },
        select: {
          description: true,
          rate: true,
        },
        take: 50,
      });

      const lowercasedQuery = query.toLowerCase();
      const seenDescriptions = new Set();

      const uniqueFilteredItems = items
        .filter(item => {
          const lowercasedDesc = item.description.toLowerCase();
          if (lowercasedDesc.includes(lowercasedQuery) && !seenDescriptions.has(lowercasedDesc)) {
            seenDescriptions.add(lowercasedDesc);
            return true;
          }
          return false;
        })
        .slice(0, 10)
        .map(item => ({
          ...item,
          isInventory: false,
        }));

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