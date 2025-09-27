import { PrismaClient } from '@prisma/client';
import { renderToString } from 'react-dom/server';
import playwright from 'playwright-core';
import chromium from '@sparticuz/chromium';
import { put } from '@vercel/blob';

// --- Step 1: Import ALL your React PDF templates ---
// Default Templates
import { ModernBlueTemplate } from '../components/pdf/modern-blue'; 
import { ModernGreenTemplate } from '../components/pdf/modern-green';
import { ClassicTemplate } from '../components/pdf/classic-black';

// Custom Templates (Import any custom template you create here)
import { BhagwanEssentialTemplate } from '../components/pdf/custom/bhagwan-essential';

const prisma = new PrismaClient();

// --- Step 2: Create the Template Registry (Map) ---
// This map links the template name string (from your database) to the actual React component.
// This replaces the need for a switch statement, making your code scalable.
const templateMap = {
  'modern-blue': ModernBlueTemplate,
  'modern-green': ModernGreenTemplate,
  'classic-tabular': ClassicTemplate,
  'bhagwan-essential': BhagwanEssentialTemplate,
  // 'acme-corp-red': AcmeCorpRedTemplate, // When you add a new template, just add it here.
};

// This helper function to get the browser instance remains unchanged.
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
 * Dynamically selects the correct template component based on the name.
 * @param {string} templateName - The name of the template from database settings.
 * @returns {React.ComponentType} The corresponding React component.
 */
function getTemplateComponent(templateName) {
  // Look up the component in our map.
  const SelectedTemplateComponent = templateMap[templateName];

  // If the specific template isn't found, log a warning and fall back to a default.
  if (!SelectedTemplateComponent) {
    console.warn(`Template "${templateName}" not found in templateMap. Falling back to 'modern-blue'.`);
    return templateMap['modern-blue'];
  }
  
  return SelectedTemplateComponent;
}

/**
 * CORE FUNCTION: Generates a PDF buffer for an invoice.
 * This is now updated to use the dynamic template map.
 */
export async function generateInvoicePDFBuffer(invoiceId) {
  const invoiceRecord = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      items: true,
      client: true,
      user: { include: { business: { include: { invoiceSettings: true } } } },
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
    
  // --- DYNAMIC TEMPLATE SELECTION ---
  const templateName = invoiceRecord.user.business.invoiceSettings?.templateName ?? 'modern-blue';
  const SelectedTemplateComponent = getTemplateComponent(templateName);

  const html = renderToString(<SelectedTemplateComponent invoiceData={templateData} />);

  let browser = null;
  try {
    browser = await getBrowser();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });
    return { pdfBuffer, invoiceNumber: invoiceRecord.invoiceNumber };
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * Generates a high-resolution PNG image for an invoice.
 * Also updated to use the dynamic template map.
 */
export async function generateInvoiceImageBuffer(invoiceId) {
  const invoiceRecord = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      items: true,
      client: true,
      user: { include: { business: { include: { invoiceSettings: true } } } },
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
    
  // --- DYNAMIC TEMPLATE SELECTION ---
  const templateName = invoiceRecord.user.business.invoiceSettings?.templateName ?? 'modern-blue';
  const SelectedTemplateComponent = getTemplateComponent(templateName);
  
  const html = renderToString(<SelectedTemplateComponent invoiceData={templateData} />);

  let browser = null;
    try {
    browser = await getBrowser();
    const page = await browser.newPage({ deviceScaleFactor: 2 });
    
    // Set a width for the page rendering canvas
    await page.setViewportSize({ width: 794, height: 1123 }); // height is a minimum
    
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'body { box-sizing: border-box; }' });
    
    // --- BUG FIX #2: Correct syntax for screenshot options ---
    // `fullPage: true` must be INSIDE the options object {}
    const imageBuffer = await page.screenshot({ 
      type: 'png',
      fullPage: true // This ensures the entire rendered invoice is captured
    });

    return { imageBuffer, invoiceNumber: invoiceRecord.invoiceNumber };
  } finally {
    if (browser) await browser.close();
  }
}
/**
 * Generates and uploads the PDF to Vercel Blob storage.
 * This function does not need any changes as it calls the refactored core function.
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