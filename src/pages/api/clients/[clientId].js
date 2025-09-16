import { verify } from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
  const { clientId } = req.query;
  const { authToken } = req.cookies;
  if (!authToken) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  try {
    const decoded = verify(authToken, SECRET_KEY);
    const userId = decoded.userId;

    // First, verify this client actually belongs to the logged-in user for any method
    const client = await prisma.client.findFirst({
      where: { id: clientId, userId: userId },
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found or you do not have permission.' });
    }

    // --- HANDLE PUT REQUEST (UPDATE) ---
    if (req.method === 'PUT') {
        const { name, email, company, phone, address, city, taxId } = req.body;

        // Basic validation
        if (!name || !phone) {
            return res.status(400).json({ message: 'Name and Phone no are required.' });
        }

        const updatedClient = await prisma.client.update({
            where: { id: clientId },
            data: {
                name,
                email,
                company: company || null,
                phone: phone || null,
                address: address || null,
                city: city || null,
                taxId: taxId || null,
            },
        });

        return res.status(200).json(updatedClient);
    }
    
    // --- HANDLE DELETE REQUEST ---
    else if (req.method === 'DELETE') {
      const invoiceCount = await prisma.invoice.count({
        where: { clientId: clientId },
      });

      if (invoiceCount > 0) {
        return res.status(409).json({
          message: 'This client cannot be deleted because they are associated with existing invoices.',
        });
      }
      
      await prisma.client.delete({
        where: { id: clientId },
      });
      
      return res.status(204).end();
    }
    
    // If the method is not PUT or DELETE, it's not allowed
    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
    
  } catch (error) {
    console.error(`API Error for client ${clientId}:`, error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}