import { PrismaClient } from '@prisma/client';
import { renderToString } from 'react-dom/server';
import playwright from 'playwright-core';
import chromium from '@sparticuz/chromium';
import { put } from '@vercel/blob';

// --- Imports remain the same ---
import { ModernBlueTemplate } from '../components/pdf/modern-blue'; 
import { ModernGreenTemplate } from '../components/pdf/modern-green';
import { ClassicTemplate } from '../components/pdf/classic-black';
import { BhagwanEssentialTemplate } from '../components/pdf/custom/bhagwan-essential';

const prisma = new PrismaClient();

const templateMap = {
  'modern-blue': ModernBlueTemplate,
  'modern-green': ModernGreenTemplate,
  'classic-tabular': ClassicTemplate,
  'bhagwan-essential': BhagwanEssentialTemplate,
};

// --- HELPER: Wrap React Output in Full HTML with Fonts ---
function wrapHtmlWithDoctype(reactHtml) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        <!-- 1. LOAD FONTS: Use Absolute URLs (e.g., Google Fonts) -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
        
        <!-- 2. DEFAULT STYLES: Ensure fonts are actually applied -->
        <style>
          body {
            font-family: 'Inter', 'Roboto', sans-serif;
            -webkit-print-color-adjust: exact; /* Ensures colors print accurately */
            print-color-adjust: exact;
          }
        </style>
      </head>
      <body>
        ${reactHtml}
      </body>
    </html>
  `;
}

async function getBrowser() {
  if (process.env.VERCEL_ENV) {
    return playwright.chromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  } else {
    return playwright.chromium.launch({ headless: true });
  }
}

function getTemplateComponent(templateName) {
  const SelectedTemplateComponent = templateMap[templateName];
  if (!SelectedTemplateComponent) {
    console.warn(`Template "${templateName}" not found. Falling back to 'modern-blue'.`);
    return templateMap['modern-blue'];
  }
  return SelectedTemplateComponent;
}

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
    throw new Error('Missing critical data to generate PDF.');
  }

  const templateData = {
    invoice: invoiceRecord,
    client: invoiceRecord.client,
    business: invoiceRecord.user.business,
    user: invoiceRecord.user,
  };
    
  const templateName = invoiceRecord.user.business.invoiceSettings?.templateName ?? 'modern-blue';
  const SelectedTemplateComponent = getTemplateComponent(templateName);

  // 1. Render Component
  const componentHtml = renderToString(<SelectedTemplateComponent invoiceData={templateData} />);
  
  // 2. Wrap it in full HTML with Font Links
  const fullHtml = wrapHtmlWithDoctype(componentHtml);

  let browser = null;
  try {
    browser = await getBrowser();
    const page = await browser.newPage();

    // 3. Set content and wait for basic load
    await page.setContent(fullHtml, { waitUntil: 'load', timeout: 30000 });

    // 4. CRITICAL FIX: Force browser to wait for fonts to finish downloading
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });
    return { pdfBuffer, invoiceNumber: invoiceRecord.invoiceNumber };
  } finally {
    if (browser) await browser.close();
  }
}

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
    throw new Error('Missing critical data to generate Image.');
  }

  const templateData = {
    invoice: invoiceRecord,
    client: invoiceRecord.client,
    business: invoiceRecord.user.business,
    user: invoiceRecord.user,
  };
    
  const templateName = invoiceRecord.user.business.invoiceSettings?.templateName ?? 'modern-blue';
  const SelectedTemplateComponent = getTemplateComponent(templateName);
  
  const componentHtml = renderToString(<SelectedTemplateComponent invoiceData={templateData} />);
  
  // Wrap HTML here too
  const fullHtml = wrapHtmlWithDoctype(componentHtml);

  let browser = null;
  try {
    browser = await getBrowser();
    const page = await browser.newPage({ deviceScaleFactor: 2 });
    await page.setViewportSize({ width: 794, height: 1123 }); 
    
    await page.setContent(fullHtml, { waitUntil: 'load', timeout: 30000 });
    
    // Add specific style for image capture
    await page.addStyleTag({ content: 'body { box-sizing: border-box; margin: 0; }' });

    // WAIT FOR FONTS HERE TOO
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    const imageBuffer = await page.screenshot({ 
      type: 'png',
      fullPage: true 
    });

    return { imageBuffer, invoiceNumber: invoiceRecord.invoiceNumber };
  } finally {
    if (browser) await browser.close();
  }
}

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