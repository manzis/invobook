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

    // --- GET: Single item with Analytics ---
    if (req.method === 'GET') {
      const existingItem = await prisma.inventoryItem.findFirst({
        where: { id: itemId, userId },
        include: {
          invoiceItems: {
            include: {
              invoice: {
                include: {
                  client: true
                }
              }
            }
          }
        }
      });

      if (!existingItem) {
        return res.status(404).json({ message: 'Inventory item not found.' });
      }

      // Compute analytics
      const salesItems = existingItem.invoiceItems.filter(item => item.invoice && item.invoice.type === 'SALES');
      const totalSold = salesItems.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
      
      const uniqueBuyersMap = new Map();
      const recentInvoices = [];

      salesItems.forEach(item => {
        const inv = item.invoice;
        recentInvoices.push({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          date: inv.date,
          status: inv.status,
          quantitySold: parseFloat(item.quantity) || 0,
          amount: parseFloat(item.amount) || 0,
          clientName: inv.client?.name || 'Unknown'
        });

        if (inv.client) {
          if (!uniqueBuyersMap.has(inv.client.id)) {
            uniqueBuyersMap.set(inv.client.id, {
              id: inv.client.id,
              name: inv.client.name,
              totalQuantity: 0,
              totalAmount: 0
            });
          }
          const buyer = uniqueBuyersMap.get(inv.client.id);
          buyer.totalQuantity += parseFloat(item.quantity) || 0;
          buyer.totalAmount += parseFloat(item.amount) || 0;
        }
      });

      // Sort invoices by date desc
      recentInvoices.sort((a, b) => new Date(b.date) - new Date(a.date));

      const analytics = {
        totalSold,
        recentInvoices,
        uniqueBuyers: Array.from(uniqueBuyersMap.values()).sort((a, b) => b.totalQuantity - a.totalQuantity)
      };

      // Exclude the raw invoiceItems to save payload size
      const { invoiceItems, ...itemData } = existingItem;
      const responseData = { ...itemData, analytics };

      return res.status(200).json(JSON.parse(JSON.stringify(responseData)));
    }

    // Verify the item exists for PUT/DELETE
    const exists = await prisma.inventoryItem.findFirst({
      where: { id: itemId, userId },
    });

    if (!exists) {
      return res.status(404).json({ message: 'Inventory item not found.' });
    }

    // --- PUT: Update item ---
    if (req.method === 'PUT') {
      const { name, description, sku, rate, purchasePrice, quantity, unit, lowStock, category } = req.body;

      const updated = await prisma.inventoryItem.update({
        where: { id: itemId },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(sku !== undefined && { sku: sku || null }),
          ...(rate !== undefined && { rate: parseFloat(rate) }),
          ...(purchasePrice !== undefined && { purchasePrice: parseFloat(purchasePrice) }),
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
