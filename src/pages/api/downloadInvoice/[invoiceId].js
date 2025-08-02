// pages/api/downloadInvoice/[invoiceId].js

import { generateAndUploadInvoicePDF } from '../../../lib/pdfGenerator';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
  
  const { invoiceId } = req.query;

  try {
    // 1. Generate the PDF and get the URL using the centralized helper
    const newPdfUrl = await generateAndUploadInvoicePDF(invoiceId);

    // 2. Update the invoice record with the new URL
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { pdfUrl: newPdfUrl },
    });

    // 3. Return the new URL to the user
    return res.status(200).json({ 
        message: 'PDF generated and saved successfully.',
        pdfUrl: newPdfUrl 
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Failed to generate PDF.',
      details: error.message
    });
  }
}