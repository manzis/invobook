import { verify } from 'jsonwebtoken';
import prisma from '../../lib/prisma'; // Ensure this path is correct

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
  // 1. Authenticate the user and get their ID
  const { authToken } = req.cookies;
  if (!authToken) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  try {
    const decoded = verify(authToken, SECRET_KEY);
    const userId = decoded.userId;

    // 2. Find the business associated with the user
    const business = await prisma.business.findUnique({
      where: { userId: userId },
    });

    if (!business) {
      return res.status(404).json({ message: 'Business not found for this user.' });
    }
    const businessId = business.id;

    // --- HANDLE GET REQUEST: Fetch invoice settings ---
    if (req.method === 'GET') {
      const settings = await prisma.invoiceSetting.findUnique({
        where: { businessId: businessId },
      });
      
      // If no settings exist, return a default object.
      // This prevents a database write on a simple GET request.
      if (!settings) {
        return res.status(200).json({
          defaultDueDays: 30,
          taxRate: 0,
          currency: 'USD',
          invoicePrefix: 'INV-',
          nextInvoiceNumber: 1,
          defaultNotes: '',
          defaultTerms: '',
          paymentInfo: '',      // Default for the new field
          paymentImageUrl: null, // Default for the new field
        });
      }
      return res.status(200).json(settings);
    }
    
    // --- HANDLE PUT REQUEST: Update or create invoice settings ---
    if (req.method === 'PUT') {
      // 3. Explicitly destructure all expected fields for security
      const { 
        defaultDueDays,
        taxRate,
        currency,
        invoicePrefix,
        nextInvoiceNumber,
        defaultNotes,
        defaultTerms,
        paymentInfo,      // New field
        paymentImageUrl   // New field
      } = req.body;

      // 4. Use `upsert` for a robust "update or create" operation.
      const updatedSettings = await prisma.invoiceSetting.upsert({
        where: { businessId: businessId },
        // What to do if settings ARE found
        update: {
            defaultDueDays: parseInt(defaultDueDays, 10) || 30,
            taxRate: parseFloat(taxRate) || 0,
            currency: currency,
            invoicePrefix: invoicePrefix,
            nextInvoiceNumber: parseInt(nextInvoiceNumber, 10) || 1,
            defaultNotes: defaultNotes,
            defaultTerms: defaultTerms,
            paymentInfo: paymentInfo,          // Update the new field
            paymentImageUrl: paymentImageUrl,  // Update the new field
        },
        // What to do if settings ARE NOT found
        create: {
            businessId: businessId,
            defaultDueDays: parseInt(defaultDueDays, 10) || 30,
            taxRate: parseFloat(taxRate) || 0,
            currency: currency,
            invoicePrefix: invoicePrefix,
            nextInvoiceNumber: parseInt(nextInvoiceNumber, 10) || 1,
            defaultNotes: defaultNotes,
            defaultTerms: defaultTerms,
            paymentInfo: paymentInfo,          // Create with the new field
            paymentImageUrl: paymentImageUrl,  // Create with the new field
        }
      });
      
      return res.status(200).json(updatedSettings);
    }
    
    // Handle any other HTTP methods
    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);

  } catch (error) {
    console.error("Invoice Settings API Error:", error);
    // Provide a generic error message to the client
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}