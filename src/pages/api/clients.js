// /pages/api/clients.js (Final Version with Proactive Duplicate Check)

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
    return res.status(401).json({ message: 'Your session is invalid or has expired.' });
  }

  // --- HANDLE GET REQUEST (This part is correct and unchanged) ---
  if (req.method === 'GET') {
    try {
        const clients = await prisma.client.findMany({
            where: { userId: userId },
            include: {
                invoices: { select: { total: true, date: true } },
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
                }, new Date(0)).toISOString().split('T')[0];
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

        // 1. Basic server-side validation
        if (!name || !phone) {
            return res.status(400).json({ message: 'Client name and phone number are required.' });
        }

        // 2. **PROACTIVE DUPLICATE CHECK**
        // Build the search condition based on what was provided.
        const duplicateConditions = [];
        if (email) duplicateConditions.push({ email });
        if (phone) duplicateConditions.push({ phone });
        
        // Only search if there's an email or phone to check.
        if (duplicateConditions.length > 0) {
            const existingClient = await prisma.client.findFirst({
                where: {
                    userId: userId, // Must belong to the current user
                    OR: duplicateConditions, // The phone OR email matches
                },
            });

            // 3. If a duplicate is found, stop the process and send a clear, safe error.
            if (existingClient) {
                // This doesn't break the server; it sends a predictable response.
                return res.status(409).json({ // 409 Conflict is the correct status code
                    message: 'A client with this phone number or email already exists.',
                });
            }
        }

        // 4. If no duplicate is found, proceed to create the new client.
        const newClient = await prisma.client.create({
            data: {
                name,
                email,
                phone,
                company,
                address,
                city,
                taxId,
                user: { connect: { id: userId } },
            },
        });
        
        // 5. Send a success response.
        return res.status(201).json(newClient); // 201 Created

    } catch (error) {
        // This catch block now acts as a final safety net for unexpected errors.
        console.error("Error creating client:", error);
        return res.status(500).json({ message: 'Failed to create client.' });
    }
  }
  
  // --- Fallback for other methods ---
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}