// /pages/api/downloadInvoice/[invoiceId].js (Final, More Robust Version)

import { generateInvoicePDFBuffer } from '../../../lib/pdfGenerator';
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process'; // <-- Import Node's own process executor

// Helper to find the correct Homebrew path.
const getPopplerDirectory = () => {
  if (process.env.VERCEL_ENV) return undefined;
  const armPath = '/opt/homebrew/bin';
  if (fs.existsSync(armPath)) return armPath;
  const intelPath = '/usr/local/bin';
  if (fs.existsSync(intelPath)) return intelPath;
  return undefined; // Let the system try to find it
};

// --- NEW: A promise-based wrapper for the conversion process ---
const convertPdfToImage = (pdfPath, outPrefix, popplerDir) => {
  return new Promise((resolve, reject) => {
    const pdftocairoPath = popplerDir ? path.join(popplerDir, 'pdftocairo') : 'pdftocairo';
    const args = [
      '-png',       // Output format is PNG
      '-f', '1',     // Start from page 1
      '-l', '1',     // End at page 1
      pdfPath,      // The input PDF file
      outPrefix     // The prefix for the output image file(s)
    ];

    const options = {
      timeout: 10000, // Kill the process if it takes longer than 10 seconds
    };

    execFile(pdftocairoPath, args, options, (error, stdout, stderr) => {
      if (error) {
        console.error("ExecFile Error:", { stdout, stderr });
        // The error object from execFile is more detailed
        return reject(error);
      }
      // If the process completes without error
      resolve(stdout);
    });
  });
};


export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { invoiceId, format } = req.query;

  try {
    const { pdfBuffer, invoiceNumber } = await generateInvoicePDFBuffer(invoiceId);

    if (format === 'image') {
      console.log(`[${invoiceId}] Starting image conversion...`);
      const tempPdfPath = path.join('/tmp', `invoice-${invoiceNumber}.pdf`);
      const tempImagePrefix = path.join('/tmp', `image-${invoiceNumber}`);
      
      try {
        console.log(`[${invoiceId}] Writing temporary PDF to: ${tempPdfPath}`);
        fs.writeFileSync(tempPdfPath, pdfBuffer);
        
        console.log(`[${invoiceId}] Calling conversion process...`);
        // --- THE CHANGE IS HERE: We now call our new robust function ---
        await convertPdfToImage(tempPdfPath, tempImagePrefix, getPopplerDirectory());
        console.log(`[${invoiceId}] Conversion process successful.`);

        const imagePath = `${tempImagePrefix}-1.png`;
        console.log(`[${invoiceId}] Reading converted image from: ${imagePath}`);
        const imageBuffer = fs.readFileSync(imagePath);

        console.log(`[${invoiceId}] Cleaning up temporary files...`);
        fs.unlinkSync(tempPdfPath);
        fs.unlinkSync(imagePath);

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoiceNumber}.png"`);
        return res.status(200).send(imageBuffer);

      } catch (conversionError) {
        console.error(`[${invoiceId}] CRITICAL: PDF to Image conversion failed.`, conversionError);
        return res.status(500).json({
          message: 'Server error during image conversion.',
          details: `Process failed with code ${conversionError.code}. Check server logs for stderr output.`
        });
      }
      
    } else {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoiceNumber}.pdf"`);
      return res.status(200).send(pdfBuffer);
    }
  } catch (error) {
    console.error(`[${invoiceId}] Error in main handler:`, error);
    return res.status(500).json({ message: 'An internal server error occurred.', details: error.message });
  }
}