// /pages/api/clients.js (Corrected and Final)

import { verify } from 'jsonwebtoken';
import prisma from '../../lib/prisma';

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
  const { authToken } = req.cookies;
  if (!authToken) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  let userId;
  try {
    const decoded = verify(authToken, SECRET_KEY);
    userId = decoded.userId;
    if (!userId) {
        throw new Error("Invalid token: userId not found.");
    }
  } catch (error) {
    console.error("Authentication error in /api/clients:", error);
    return res.status(401).json({ message: 'Your session is invalid or has expired.' });
  }


  // --- HANDLE GET REQUEST ---
  if (req.method === 'GET') {
    try {
        const clients = await prisma.client.findMany({
            where: { userId: userId },
            include: {
                invoices: {
                    select: { total: true, date: true, },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const clientsWithAggregates = clients.map(client => {
            const totalValue = client.invoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
            const totalInvoices = client.invoices.length;
            
            let lastInvoiceDate = null;
            if (totalInvoices > 0) {
                lastInvoiceDate = client.invoices.reduce((latest, inv) => {
                    const invDate = new Date(inv.date);
                    return invDate > latest ? invDate : latest;
                }, new Date(0)).toISOString().split('T')[0]; // Get YYYY-MM-DD
            }

            const { invoices, ...clientData } = client;
            return {
                ...clientData,
                totalInvoices,
                totalAmount: totalValue,
                lastInvoice: lastInvoiceDate,
            };
        });

        return res.status(200).json(clientsWithAggregates);

    } catch (error) {
        console.error("Error fetching clients:", error);
        return res.status(500).json({ message: 'Failed to fetch clients.' });
    }
  }
  
  // --- **FIXED**: HANDLE POST REQUEST ---
  else if (req.method === 'POST') {
    try {
        const { name, email, phone, company, address, city, taxId } = req.body;

        // Server-side validation
        if (!name || !email) {
            return res.status(400).json({ message: 'Client name and email are required.' });
        }

        const newClient = await prisma.client.create({
            data: {
                name,
                email,
                phone,
                company,
                address,
                city,
                taxId,
                user: { connect: { id: userId } }, // Connect to the logged-in user
            },
        });
        
        // **CRUCIAL**: Send a success response with the newly created client data.
        // 201 means "Created".
        return res.status(201).json(newClient);

    } catch (error) {
        // Handle potential errors like a non-unique email
        if (error.code === 'P2002') { // Prisma's unique constraint violation code
            return res.status(409).json({ message: 'A client with this email already exists.' });
        }
        console.error("Error creating client:", error);
        return res.status(500).json({ message: 'Failed to create client.' });
    }
  }
  
  // --- Fallback for other methods ---
  else {
    // If the request method is not GET or POST, send a 405 Method Not Allowed response.
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}