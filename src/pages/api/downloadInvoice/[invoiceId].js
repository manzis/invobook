// /pages/api/downloadInvoice/[invoiceId].js (Corrected and Final Version)

import { generateInvoicePDFBuffer } from '../../../lib/pdfGenerator';
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';

// Helper to find the correct Homebrew path. (No changes)
const getPopplerDirectory = () => {
  if (process.env.VERCEL_ENV) return undefined;
  const armPath = '/opt/homebrew/bin';
  if (fs.existsSync(armPath)) return armPath;
  const intelPath = '/usr/local/bin';
  if (fs.existsSync(intelPath)) return intelPath;
  return undefined;
};

// Promise-based wrapper for the conversion process. (No changes)
const convertPdfToImage = (pdfPath, outPrefix, popplerDir) => {
  return new Promise((resolve, reject) => {
    const pdftocairoPath = popplerDir ? path.join(popplerDir, 'pdftocairo') : 'pdftocairo';
    const args = ['-png', '-f', '1', '-l', '1', pdfPath, outPrefix];
    const options = { timeout: 10000 };

    execFile(pdftocairoPath, args, options, (error, stdout, stderr) => {
      if (error) {
        console.error("ExecFile Error:", { stdout, stderr });
        return reject(error);
      }
      resolve(stdout);
    });
  });
};

export default async function handler(req, res) {
  // --- CHANGE 1: Switched from POST to GET ---
  // This now correctly handles the request from the client's window.open()
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']); // Let browsers know GET is the only allowed method
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { invoiceId, format } = req.query;

  try {
    const { pdfBuffer, invoiceNumber } = await generateInvoicePDFBuffer(invoiceId);

    // Image logic: Force download ('attachment') - this is correct.
    if (format === 'image') {
      const tempPdfPath = path.join('/tmp', `invoice-${invoiceNumber}.pdf`);
      const tempImagePrefix = path.join('/tmp', `image-${invoiceNumber}`);
      
      try {
        fs.writeFileSync(tempPdfPath, pdfBuffer);
        await convertPdfToImage(tempPdfPath, tempImagePrefix, getPopplerDirectory());
        const imagePath = `${tempImagePrefix}-1.png`;
        const imageBuffer = fs.readFileSync(imagePath);

        fs.unlinkSync(tempPdfPath);
        fs.unlinkSync(imagePath);

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoiceNumber}.png"`);
        return res.status(200).send(imageBuffer);

      } catch (conversionError) {
        console.error(`[${invoiceId}] CRITICAL: PDF to Image conversion failed.`, conversionError);
        return res.status(500).json({
          message: 'Server error during image conversion.',
          details: `Process failed. Check server logs.`
        });
      }
      
    } else {
      // PDF logic: Open in tab ('inline')
      res.setHeader('Content-Type', 'application/pdf');

      // --- CHANGE 2: Use 'inline' to open in the tab ---
      // This tells the browser to display the file, not just download it.
      res.setHeader(
        'Content-Disposition',
        `inline; filename="invoice-${invoiceNumber}.pdf"`
      );
      
      return res.status(200).send(pdfBuffer);
    }
  } catch (error) {
    console.error(`[${invoiceId}] Error in main handler:`, error);
    return res.status(500).json({ message: 'An internal server error occurred.', details: error.message });
  }
}