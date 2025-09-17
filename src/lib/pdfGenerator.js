import { PrismaClient } from '@prisma/client';
import { renderToString } from 'react-dom/server';
import playwright from 'playwright-core';
import chromium from '@sparticuz/chromium';
import { put } from '@vercel/blob';

// --- Import your React PDF templates ---
import { ModernBlueTemplate } from '../components/pdf/modern-blue'; 
import { ModernGreenTemplate } from '../components/pdf/modern-green';
import { ClassicTemplate } from '../components/pdf/classic-black';

const prisma = new PrismaClient();

// This helper is correct and used by both functions
async function getBrowser() {
  // VERCEL PRODUCTION / PREVIEW ENVIRONMENT
  if (process.env.VERCEL_ENV) {
    return playwright.chromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  }
  // LOCAL DEVELOPMENT ENVIRONMENT
  else {
    return playwright.chromium.launch({
      headless: true,
    });
  }
}

/**
 * CORE FUNCTION: Generates a PDF for an invoice.
 * This function remains unchanged.
 */
export async function generateInvoicePDFBuffer(invoiceId) {
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
    
  const templateName = invoiceRecord.user.business.invoiceSettings?.templateName ?? 'modern-blue';
  let SelectedTemplateComponent;
  switch (templateName) {
    case 'modern-green': SelectedTemplateComponent = ModernGreenTemplate; break;
    case 'classic-tabular': SelectedTemplateComponent = ClassicTemplate; break;
    case 'modern-blue': default: SelectedTemplateComponent = ModernBlueTemplate; break;
  }

  const html = renderToString(<SelectedTemplateComponent invoiceData={templateData} />);

  let browser = null;
  try {
    browser = await getBrowser();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    });
    return { pdfBuffer, invoiceNumber: invoiceRecord.invoiceNumber };
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * --- FINAL HIGH-QUALITY A4-SIZED IMAGE FUNCTION WITH PADDING ---
 * Generates a high-resolution PNG image with the exact dimensions of an A4 page
 * and an internal 20px padding.
 */
export async function generateInvoiceImageBuffer(invoiceId) {
  // 1. Fetch data (This part is correct)
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
    throw new Error('Missing critical data (user, business, or client) to generate Image.');
  }

  const templateData = {
    invoice: invoiceRecord,
    client: invoiceRecord.client,
    business: invoiceRecord.user.business,
    user: invoiceRecord.user,
  };
    
  // 2. Select and render the template (Correct)
  const templateName = invoiceRecord.user.business.invoiceSettings?.templateName ?? 'modern-blue';
  let SelectedTemplateComponent;
  switch (templateName) {
    case 'modern-green': SelectedTemplateComponent = ModernGreenTemplate; break;
    case 'classic-tabular': SelectedTemplateComponent = ClassicTemplate; break;
    case 'modern-blue': default: SelectedTemplateComponent = ModernBlueTemplate; break;
  }
  const html = renderToString(<SelectedTemplateComponent invoiceData={templateData} />);

  // 3. Use Playwright with precise A4 settings
  let browser = null;
  try {
    browser = await getBrowser();
    
    // Create a new page with 2x resolution for top-notch quality
    const page = await browser.newPage({ deviceScaleFactor: 2 });
    
    // Set the viewport to A4 dimensions (at 96 DPI) to define our canvas
    await page.setViewportSize({
      width: 794,
      height: 1123,
    });
    
    await page.setContent(html, { waitUntil: 'networkidle' });
    
    // --- THIS IS THE KEY CHANGE ---
    // Inject a CSS rule to add 20px padding to the body.
    // box-sizing ensures the padding is contained within the body's dimensions.
    await page.addStyleTag({ content: 'body { padding: 20px; box-sizing: border-box; }' });
    
    // Take a screenshot of the entire viewport, which now includes the padding
    const imageBuffer = await page.screenshot({
      type: 'png',
    });

    return { imageBuffer, invoiceNumber: invoiceRecord.invoiceNumber };
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * Your existing upload function. This remains unchanged.
 */
export async function generateAndUploadInvoicePDF(invoiceId) {
  try {
    const { pdfBuffer, invoiceNumber } = await generateInvoicePDFBuffer(invoiceId);
    const fileName = `invoice-${invoiceNumber}-${Date.now()}.pdf`;
    const blob = await put(fileName, pdfBuffer, {
      access: 'public',
      contentType: 'application/pdf',
    });
    return blob.url;
  } catch (error) {
    console.error(`Failed to generate and upload PDF for invoice ${invoiceId}:`, error);
    throw error;
  }
}