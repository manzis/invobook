// /src/pages/api/inventory/stats.js
import { verify } from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
  const { authToken } = req.cookies;
  if (!authToken) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const decoded = verify(authToken, SECRET_KEY);
    const userId = decoded.userId;

    const items = await prisma.inventoryItem.findMany({
      where: { userId, isActive: true },
      select: { rate: true, quantity: true, lowStock: true },
    });

    const totalProducts = items.length;
    let totalStockValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    for (const item of items) {
      const rate = parseFloat(item.rate || 0);
      const qty = item.quantity || 0;
      totalStockValue += rate * qty;

      if (qty <= 0) {
        outOfStockCount++;
      } else if (qty <= item.lowStock) {
        lowStockCount++;
      }
    }

    // Fetch currency from business settings
    const business = await prisma.business.findUnique({
      where: { userId },
      include: { invoiceSettings: true },
    });
    const currency = business?.invoiceSettings?.currency || 'USD';

    const CURRENCY_SYMBOLS = {
      USD: '$', EUR: '€', JPY: '¥', GBP: '£',
      AUD: '$', CAD: '$', CHF: 'CHF', CNY: '¥',
      INR: '₹', BRL: 'R$', RUB: '₽', ZAR: 'R',
      SGD: '$', NZD: '$', NPR: 'Rs. ',
    };

    const symbol = CURRENCY_SYMBOLS[currency] || '$';
    const locale = (currency === 'INR' || currency === 'NPR') ? 'en-IN' : 'en-US';
    const formattedValue = totalStockValue.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const stockValueDisplay = currency === 'NPR'
      ? `Rs. ${formattedValue}`
      : `${symbol}${symbol.length > 1 ? ' ' : ''}${formattedValue}`;

    return res.status(200).json({
      totalProducts,
      totalStockValue: stockValueDisplay,
      lowStockCount,
      outOfStockCount,
    });

  } catch (error) {
    console.error('Inventory Stats API Error:', error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}
