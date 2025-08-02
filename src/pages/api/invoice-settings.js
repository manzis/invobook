// /pages/api/invoice-settings.js

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

    // First, we need to find the business associated with the logged-in user
    const business = await prisma.business.findUnique({
      where: { userId: userId },
    });

    if (!business) {
      return res.status(404).json({ message: 'Business not found for this user.' });
    }
    const businessId = business.id;

    // --- HANDLE GET REQUEST: Fetch invoice settings ---
    if (req.method === 'GET') {
      let settings = await prisma.invoiceSetting.findUnique({
        where: { businessId: businessId },
      });
      
      // If no settings exist for this business yet, create and return default ones
      if (!settings) {
        settings = await prisma.InvoiceSetting.create({
          data: { businessId: businessId } // Creates with default values from schema
        });
      }
      return res.status(200).json(settings);
    }
    
    // --- HANDLE PUT REQUEST: Update invoice settings ---
    else if (req.method === 'PUT') {
      const { ...settingsData } = req.body;

      // Use `upsert` to update if exists, or create if it doesn't.
      // This is robust and handles new users automatically.
      const updatedSettings = await prisma.invoiceSetting.upsert({
        where: { businessId: businessId },
        update: {
            defaultDueDays: parseInt(settingsData.defaultDueDays, 10),
            taxRate: parseFloat(settingsData.taxRate),
            currency: settingsData.currency,
            invoicePrefix: settingsData.invoicePrefix,
            nextInvoiceNumber: parseInt(settingsData.nextInvoiceNumber, 10),
            defaultNotes: settingsData.defaultNotes,
            defaultTerms: settingsData.defaultTerms,
        },
        create: {
            businessId: businessId,
            ...settingsData,
        }
      });
      
      return res.status(200).json({ message: 'Invoice settings updated successfully', settings: updatedSettings });
    }
    
    else {
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

  } catch (error) {
    console.error("Invoice Settings API Error:", error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}