// lib/pdfGenerator.js

import { PrismaClient } from '@prisma/client';
import { renderToString } from 'react-dom/server';
import { InvoiceTemplate } from '../components/pdf/InvoiceTemplate'; // Adjust path if needed
import playwright from 'playwright-core';
import chromium from 'chrome-aws-lambda';
import { put } from '@vercel/blob';

const prisma = new PrismaClient();

const getExecutablePath = async () => {
  if (process.env.VERCEL_ENV === 'production') {
    return await chromium.executablePath;
  }
  return playwright.chromium.executablePath();
};

/**
 * Generates a PDF for a given invoice, uploads it to Vercel Blob,
 * and returns the public URL.
 * @param {string} invoiceId - The ID of the invoice to generate a PDF for.
 * @returns {Promise<string>} The public URL of the uploaded PDF.
 */
export async function generateAndUploadInvoicePDF(invoiceId) {
  try {
    // 1. Fetch all necessary data for the template
    const invoiceRecord = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: true,
        client: true,
        user: { include: { business: true } },
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

    // 2. Render React component to HTML
    const html = renderToString(<InvoiceTemplate invoiceData={templateData} />);

    // 3. Launch Playwright and create PDF buffer
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

    // 4. Upload PDF to Vercel Blob
    const fileName = `invoice-${invoiceRecord.invoiceNumber}-${Date.now()}.pdf`; // Add timestamp to filename
    const blob = await put(fileName, pdfBuffer, {
      access: 'public',
      contentType: 'application/pdf',
    });

    // 5. Return the new URL
    return blob.url;

  } catch (error) {
    console.error(`Failed to generate PDF for invoice ${invoiceId}:`, error);
    // Re-throw the error so the calling function knows it failed
    throw error;
  }
}