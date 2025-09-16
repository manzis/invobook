
// /pages/api/convertPdfToImage/[invoiceId].js

import prisma from '../../../lib/prisma'; // Adjust path as needed// A helper to get the PDF path
import poppler from 'pdf-poppler';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { invoiceId } = req.query;

  try {
    // 1. Find the invoice to ensure it exists
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }

    // 2. Determine the path to the PDF file.
    // This logic should be the same as your PDF generation.
    // It should either find the existing PDF or generate a new one.
    // For this example, we assume a function `getInvoicePDFPath` exists.
    const pdfPath = await getInvoicePDFPath(invoice); // This might generate the PDF if it doesn't exist.

    // 3. Set options for the conversion (e.g., format, quality)
    const options = {
      format: 'png', // can be 'jpeg', 'tiff', etc.
      out_dir: path.dirname(pdfPath), // Output in the same directory
      out_prefix: `invoice-image-${invoice.id}`, // Temporary filename
      page: 1, // Convert only the first page
    };

    // 4. Perform the conversion
    await poppler.convert(pdfPath, options);

    // 5. Read the converted image file into a buffer
    const imagePath = path.join(path.dirname(pdfPath), `invoice-image-${invoice.id}-1.png`);
    const imageBuffer = fs.readFileSync(imagePath);

    // 6. Clean up: Delete the temporary image file from the server
    fs.unlinkSync(imagePath);

    // 7. Send the image data back to the client
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.png"`);
    return res.status(200).send(imageBuffer);

  } catch (error) {
    console.error("PDF to Image Conversion Error:", error);
    return res.status(500).json({ message: 'An internal server error occurred during conversion.' });
  }
}