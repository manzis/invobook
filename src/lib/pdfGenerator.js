// lib/pdfGenerator.js

import { PrismaClient } from '@prisma/client';
import { renderToString } from 'react-dom/server';
import playwright from 'playwright-core';
import chromium from 'chrome-aws-lambda';
import { put } from '@vercel/blob';

// --- Step 1: Correctly import each template with a UNIQUE name ---
// IMPORTANT: Please verify these paths are correct for your project structure.
import { InvoiceTemplate as ModernBlueTemplate } from '../components/pdf/modern-blue'; 
import { ModernGreenTemplate } from '../components/pdf/modern-green';
import { ClassicTemplate } from '../components/pdf/classic-black';

const prisma = new PrismaClient();

const getExecutablePath = async () => {
  // This logic for Vercel/local environment is correct
  if (process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview') {
    return await chromium.executablePath;
  }
  return playwright.chromium.executablePath();
};

/**
 * Generates a PDF for a given invoice using the user's selected template,
 * uploads it to Vercel Blob, and returns the public URL.
 * @param {string} invoiceId - The ID of the invoice to generate a PDF for.
 * @returns {Promise<string>} The public URL of the uploaded PDF.
 */
export async function generateAndUploadInvoicePDF(invoiceId) {
  try {
    // --- Step 2: Update Prisma query to include the InvoiceSetting ---
    const invoiceRecord = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: true,
        client: true,
        user: {
          include: {
            business: {
              // Fetch the related invoice settings for the business
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
    
    // --- Step 3: Dynamically select the template component ---
    
    // Safely get the template name. If settings don't exist, use the schema's default.
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

    // 4. Render the SELECTED React component to HTML
    const html = renderToString(<SelectedTemplateComponent invoiceData={templateData} />);

    // 5. Launch Playwright and create PDF buffer (No changes needed here)
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

    // 6. Upload PDF to Vercel Blob (No changes needed here)
    const fileName = `invoice-${invoiceRecord.invoiceNumber}-${Date.now()}.pdf`;
    const blob = await put(fileName, pdfBuffer, {
      access: 'public',
      contentType: 'application/pdf',
    });

    // 7. Return the new URL
    return blob.url;

  } catch (error) {
    console.error(`Failed to generate PDF for invoice ${invoiceId}:`, error);
    throw error;
  }
}