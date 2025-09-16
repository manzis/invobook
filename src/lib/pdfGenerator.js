// /lib/pdfGenerator.js (This file is correct - No fixes needed)

import { PrismaClient } from '@prisma/client';
import { renderToString } from 'react-dom/server';
import playwright from 'playwright-core';
import chromium from 'chrome-aws-lambda';
import { put } from '@vercel/blob';

// --- Import your React PDF templates ---
// This approach is flexible and correct.
import { ModernBlueTemplate } from '../components/pdf/modern-blue'; 
import { ModernGreenTemplate } from '../components/pdf/modern-green';
import { ClassicTemplate } from '../components/pdf/classic-black';

const prisma = new PrismaClient();

// This helper correctly determines the Chromium path for local vs. Vercel environments.
const getExecutablePath = async () => {
  if (process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview') {
    return await chromium.executablePath;
  }
  return playwright.chromium.executablePath();
};


/**
 * CORE FUNCTION: Generates a PDF for an invoice and returns its raw data (Buffer).
 * This function is the heart of the generator and is correctly implemented.
 * It does not handle uploads, making it perfectly reusable.
 * @param {string} invoiceId - The ID of the invoice to generate.
 * @returns {Promise<{pdfBuffer: Buffer, invoiceNumber: string}>} An object containing the PDF data and invoice number.
 */
export async function generateInvoicePDFBuffer(invoiceId) {
  // 1. Fetch all necessary data from Prisma in a single, efficient query.
  const invoiceRecord = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      items: true,
      client: true,
      user: {
        include: {
          business: {
            include: {
              invoiceSettings: true,
            },
          },
        },
      },
    },
  });

  if (!invoiceRecord || !invoiceRecord.user || !invoiceRecord.user.business) {
    throw new Error('Missing critical data (user, business, or client) to generate PDF.');
  }

  const templateData = {
    invoice: invoiceRecord,
    client: invoiceRecord.client,
    business: invoiceRecord.user.business,
    user: invoiceRecord.user,
  };
    
  // 2. Dynamically select the correct React template component based on user settings.
  // This is a robust way to handle multiple templates.
  const templateName = invoiceRecord.user.business.invoiceSettings?.templateName ?? 'modern-blue';
  let SelectedTemplateComponent;
  switch (templateName) {
    case 'modern-green':
      SelectedTemplateComponent = ModernGreenTemplate;
      break;
    case 'classic-tabular':
      SelectedTemplateComponent = ClassicTemplate;
      break;
    case 'modern-blue':
    default:
      SelectedTemplateComponent = ModernBlueTemplate;
      break;
  }

  // 3. Render the React component into an HTML string on the server.
  const html = renderToString(<SelectedTemplateComponent invoiceData={templateData} />);

  // 4. Use Playwright to convert the HTML string into a PDF file in memory.
  const browser = await playwright.chromium.launch({
    args: process.env.VERCEL_ENV === 'production' ? chromium.args : [],
    executablePath: await getExecutablePath(),
    headless: true,
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle' });
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
  });
  await browser.close();

  // 5. Return the raw PDF data (Buffer) and the invoice number for use in other functions.
  return { pdfBuffer, invoiceNumber: invoiceRecord.invoiceNumber };
}

/**
 * A specific utility function that generates, uploads to Vercel Blob,
 * and returns the public URL. This is used when you need to store the PDF.
 * @param {string} invoiceId - The ID of the invoice.
 * @returns {Promise<string>} The public URL of the uploaded PDF.
 */
export async function generateAndUploadInvoicePDF(invoiceId) {
  try {
    // A. Get the PDF buffer and invoice number from our core function.
    const { pdfBuffer, invoiceNumber } = await generateInvoicePDFBuffer(invoiceId);
    
    // B. Upload the buffer to Vercel Blob.
    const fileName = `invoice-${invoiceNumber}-${Date.now()}.pdf`;
    const blob = await put(fileName, pdfBuffer, {
      access: 'public',
      contentType: 'application/pdf',
    });

    // C. Return the public URL.
    return blob.url;

  } catch (error) {
    console.error(`Failed to generate and upload PDF for invoice ${invoiceId}:`, error);
    throw error;
  }
}