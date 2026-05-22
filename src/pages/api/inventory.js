// /src/pages/api/inventory.js
import { verify } from 'jsonwebtoken';
import prisma from '../../lib/prisma';
import { createNotification } from '../../lib/notifications';

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
  const { authToken } = req.cookies;
  if (!authToken) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  try {
    const decoded = verify(authToken, SECRET_KEY);
    const userId = decoded.userId;

    // --- GET: List inventory items ---
    if (req.method === 'GET') {
      const { search, status, category } = req.query;

      const where = { userId, isActive: true };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (category && category !== 'all') {
        where.category = category;
      }

      if (status === 'low') {
        // Items where quantity > 0 but <= lowStock threshold
        where.quantity = { gt: 0 };
        // We'll filter lowStock in-memory since Prisma can't compare two fields
      } else if (status === 'out') {
        where.quantity = { lte: 0 };
      } else if (status === 'in') {
        where.quantity = { gt: 0 };
      }

      const items = await prisma.inventoryItem.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
      });

      // If filtering for low stock, do in-memory filter
      let filtered = items;
      if (status === 'low') {
        filtered = items.filter(item => item.quantity > 0 && item.quantity <= item.lowStock);
      }

      return res.status(200).json(JSON.parse(JSON.stringify(filtered)));
    }

    // --- POST: Create inventory item ---
    if (req.method === 'POST') {
      const { name, description, sku, rate, quantity, unit, lowStock, category } = req.body;

      if (!name || rate === undefined) {
        return res.status(400).json({ message: 'Name and rate are required.' });
      }

      const newItem = await prisma.inventoryItem.create({
        data: {
          name,
          description: description || null,
          sku: sku || null,
          rate: parseFloat(rate),
          quantity: parseFloat(quantity) || 0,
          unit: unit || 'pcs',
          lowStock: parseFloat(lowStock) || 5,
          category: category || null,
          userId,
        },
      });

      return res.status(201).json(JSON.parse(JSON.stringify(newItem)));
    }

    // --- DELETE: Bulk soft-delete ---
    if (req.method === 'DELETE') {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ message: 'Array of item IDs required.' });
      }

      await prisma.inventoryItem.updateMany({
        where: { id: { in: ids }, userId },
        data: { isActive: false },
      });

      return res.status(200).json({ message: 'Items deleted successfully.' });
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);

  } catch (error) {
    console.error('Inventory API Error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'An item with this SKU already exists.' });
    }
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}
