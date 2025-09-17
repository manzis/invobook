// /pages/api/downloadInvoice/[invoiceId].js (Final Version using Playwright Screenshot)

// --- CHANGE 1: Import BOTH the PDF and the new Image generator functions ---
import { generateInvoicePDFBuffer, generateInvoiceImageBuffer } from '../../../lib/pdfGenerator';

export default async function handler(req, res) {
  // This GET method is correct and should not be changed.
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { invoiceId, format } = req.query;

  try {
    // --- CHANGE 2: Call the correct function based on the 'format' query parameter ---
    if (format === 'image') {
      // Use the new, reliable screenshot function. All the complex fs/path/poppler code is gone.
      const { imageBuffer, invoiceNumber } = await generateInvoiceImageBuffer(invoiceId);

      // Set headers and send the image buffer
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoiceNumber}.png"`);
      return res.status(200).send(imageBuffer);

    } else {
      // For PDFs, use the existing PDF function. This logic is already correct.
      const { pdfBuffer, invoiceNumber } = await generateInvoicePDFBuffer(invoiceId);

      // Set headers to open the PDF in the browser tab
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="invoice-${invoiceNumber}.pdf"`);
      return res.status(200).send(pdfBuffer);
    }
  } catch (error) {
    console.error(`[${invoiceId}] Error in main handler:`, error);
    return res.status(500).json({ message: 'An internal server error occurred.', details: error.message });
  }
}