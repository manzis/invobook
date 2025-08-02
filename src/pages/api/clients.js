// /pages/api/clients.js (Corrected and Final)

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

    // --- UPDATED GET REQUEST: Fetch clients with invoice aggregates ---
    if (req.method === 'GET') {
      const clients = await prisma.client.findMany({
        where: { userId: userId },
        // Use `include` to fetch related data
        include: {
          // We're interested in the `invoices` relation for each client
          invoices: {
            select: {
              total: true, // Select the 'total' field from each invoice
              date: true,  // Also get the date for "Last Invoice"
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // --- Post-process the data to calculate the aggregates ---
      const clientsWithAggregates = clients.map(client => {
        const totalValue = client.invoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0);
        const totalInvoices = client.invoices.length;
        
        // Find the most recent invoice date
        let lastInvoiceDate = null;
        if (totalInvoices > 0) {
            lastInvoiceDate = client.invoices.reduce((latest, inv) => {
                const invDate = new Date(inv.date);
                return invDate > latest ? invDate : latest;
            }, new Date(0)).toISOString().split('T')[0];
        }

        // We return a new object with the calculated fields,
        // and remove the original invoices array to keep the payload clean.
        const { invoices, ...clientData } = client;
        return {
          ...clientData,
          totalInvoices,
          totalAmount: totalValue,
          lastInvoice: lastInvoiceDate,
        };
      });

      return res.status(200).json(clientsWithAggregates);
    }
    
    // --- POST Request (no changes needed) ---
    else if (req.method === 'POST') {
      // ... your existing create client logic is correct
    }
    
    // ...
  } catch (error) {
    console.error("Clients API Error:", error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}