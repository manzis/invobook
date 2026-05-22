// /src/pages/api/inventory/[itemId].js
import { verify } from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
  const { authToken } = req.cookies;
  if (!authToken) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  try {
    const decoded = verify(authToken, SECRET_KEY);
    const userId = decoded.userId;
    const { itemId } = req.query;

    // Verify the item belongs to this user
    const existingItem = await prisma.inventoryItem.findFirst({
      where: { id: itemId, userId },
    });

    if (!existingItem) {
      return res.status(404).json({ message: 'Inventory item not found.' });
    }

    // --- GET: Single item ---
    if (req.method === 'GET') {
      return res.status(200).json(JSON.parse(JSON.stringify(existingItem)));
    }

    // --- PUT: Update item ---
    if (req.method === 'PUT') {
      const { name, description, sku, rate, quantity, unit, lowStock, category } = req.body;

      const updated = await prisma.inventoryItem.update({
        where: { id: itemId },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(sku !== undefined && { sku: sku || null }),
          ...(rate !== undefined && { rate: parseFloat(rate) }),
          ...(quantity !== undefined && { quantity: parseFloat(quantity) }),
          ...(unit !== undefined && { unit }),
          ...(lowStock !== undefined && { lowStock: parseFloat(lowStock) }),
          ...(category !== undefined && { category: category || null }),
        },
      });

      return res.status(200).json(JSON.parse(JSON.stringify(updated)));
    }

    // --- DELETE: Soft delete ---
    if (req.method === 'DELETE') {
      await prisma.inventoryItem.update({
        where: { id: itemId },
        data: { isActive: false },
      });

      return res.status(200).json({ message: 'Item deleted successfully.' });
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);

  } catch (error) {
    console.error('Inventory Item API Error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'An item with this SKU already exists.' });
    }
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}
