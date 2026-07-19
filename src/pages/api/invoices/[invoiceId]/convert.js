import { verify } from 'jsonwebtoken';
import prisma from '../../../../lib/prisma';

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { authToken } = req.cookies;
  if (!authToken) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  try {
    const decoded = verify(authToken, SECRET_KEY);
    const userId = decoded.userId;
    const { invoiceId: id } = req.query;

    const invoice = await prisma.invoice.findUnique({
      where: { id: id },
    });

    if (!invoice || invoice.userId !== userId) {
      return res.status(404).json({ message: 'Quotation not found.' });
    }

    if (invoice.type !== 'QUOTATION') {
      return res.status(400).json({ message: 'Only quotations can be converted.' });
    }

    // Convert to SALES
    const updatedInvoice = await prisma.invoice.update({
      where: { id: id },
      data: {
        type: 'SALES',
        status: 'PENDING'
      },
    });

    return res.status(200).json({ message: 'Converted to Sales Invoice', invoice: updatedInvoice });
  } catch (error) {
    console.error("Convert API Error:", error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}
