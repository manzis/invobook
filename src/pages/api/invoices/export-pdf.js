import { PrismaClient } from '@prisma/client';
import playwright from 'playwright-core';
import chromium from '@sparticuz/chromium';

const prisma = new PrismaClient();

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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { ids } = req.query;
  if (!ids) {
    return res.status(400).json({ message: 'Missing ids parameter' });
  }

  const invoiceIds = ids.split(',').filter(Boolean);
  if (invoiceIds.length === 0) {
    return res.status(400).json({ message: 'No valid ids provided' });
  }

  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        id: { in: invoiceIds }
      },
      include: {
        client: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    if (invoices.length === 0) {
      return res.status(404).json({ message: 'No invoices found' });
    }

    // Calculations
    const totalSelected = invoices.length;
    const totalSubtotal = invoices.reduce((sum, inv) => sum + (Number(inv.subtotal) || 0), 0);
    const totalTax = invoices.reduce((sum, inv) => sum + (Number(inv.tax) || 0), 0);
    const totalRevenue = invoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
    
    const totalPaid = invoices
      .filter(inv => inv.status === 'PAID')
      .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
      
    const totalOutstanding = totalRevenue - totalPaid;

    const formatCurrency = (val) => {
      const formatted = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(val);
      return 'Rs. ' + formatted;
    };

    const getStatusClass = (status) => {
      switch (status) {
        case 'PAID': return 'status-paid';
        case 'PENDING': return 'status-pending';
        case 'OVERDUE': return 'status-overdue';
        default: return 'status-draft';
      }
    };

    const rowsHtml = invoices.map(inv => `
      <tr>
        <td><strong>${inv.invoiceNumber}</strong></td>
        <td>${new Date(inv.date).toLocaleDateString()}</td>
        <td>
          <div style="font-weight: 500;">${inv.client?.name || 'N/A'}</div>
          <div style="font-size: 11px; color: #808080;">${inv.client?.email || ''}</div>
        </td>
        <td>${inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}</td>
        <td style="text-align: right;">${formatCurrency(inv.subtotal)}</td>
        <td style="text-align: right;">${formatCurrency(inv.tax)}</td>
        <td style="text-align: right; font-weight: 600;">${formatCurrency(inv.total)}</td>
        <td><span class="status-badge ${getStatusClass(inv.status)}">${inv.status}</span></td>
      </tr>
    `).join('');

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Geist', -apple-system, sans-serif;
              color: #171717;
              margin: 40px;
              background: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 1px solid #ebebeb;
              padding-bottom: 24px;
              margin-bottom: 32px;
            }
            .title {
              font-size: 24px;
              font-weight: 600;
              letter-spacing: -0.6px;
              margin: 0;
            }
            .subtitle {
              font-size: 13px;
              color: #666666;
              margin: 4px 0 0 0;
            }
            .logo {
              font-size: 20px;
              font-weight: 700;
              letter-spacing: -0.5px;
              color: #171717;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 16px;
              margin-bottom: 32px;
            }
            .stat-card {
              background: #fafafa;
              border: 1px solid #ebebeb;
              border-radius: 8px;
              padding: 16px;
            }
            .stat-label {
              font-size: 11px;
              text-transform: uppercase;
              color: #808080;
              font-weight: 500;
              letter-spacing: 0.5px;
              margin-bottom: 6px;
            }
            .stat-value {
              font-size: 20px;
              font-weight: 600;
              letter-spacing: -0.4px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 32px;
            }
            th {
              text-align: left;
              font-size: 11px;
              text-transform: uppercase;
              color: #808080;
              font-weight: 500;
              letter-spacing: 0.5px;
              padding: 12px 16px;
              border-bottom: 2px solid #ebebeb;
            }
            td {
              padding: 12px 16px;
              font-size: 13px;
              border-bottom: 1px solid #ebebeb;
            }
            tr:nth-child(even) td {
              background: #fafafa;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 8px;
              font-size: 10px;
              font-weight: 500;
              border-radius: 9999px;
              text-transform: uppercase;
            }
            .status-paid {
              background: rgba(16, 185, 129, 0.1);
              color: #10b981;
            }
            .status-pending {
              background: rgba(245, 158, 11, 0.1);
              color: #f59e0b;
            }
            .status-overdue {
              background: rgba(239, 68, 68, 0.1);
              color: #ef4444;
            }
            .status-draft {
              background: rgba(128, 128, 128, 0.1);
              color: #808080;
            }
            .total-row td {
              font-weight: 600;
              background: #ffffff !important;
              border-top: 2px solid #ebebeb;
              border-bottom: 2px solid #ebebeb;
              font-size: 14px;
            }
            .footer {
              text-align: center;
              font-size: 11px;
              color: #808080;
              margin-top: 48px;
              border-top: 1px solid #ebebeb;
              padding-top: 16px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">Invoice Analysis Report</h1>
              <p class="subtitle">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} | Filtered Dataset</p>
            </div>
            <div class="logo">Invobook</div>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Total Selected</div>
              <div class="stat-value">${totalSelected}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Total Revenue</div>
              <div class="stat-value">${formatCurrency(totalRevenue)}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Total Paid</div>
              <div class="stat-value" style="color: #10b981;">${formatCurrency(totalPaid)}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Total Outstanding</div>
              <div class="stat-value" style="color: #f59e0b;">${formatCurrency(totalOutstanding)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Client</th>
                <th>Due Date</th>
                <th style="text-align: right;">Subtotal</th>
                <th style="text-align: right;">Tax</th>
                <th style="text-align: right;">Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <tr class="total-row">
                <td colspan="4">Total</td>
                <td style="text-align: right;">${formatCurrency(totalSubtotal)}</td>
                <td style="text-align: right;">${formatCurrency(totalTax)}</td>
                <td style="text-align: right;">${formatCurrency(totalRevenue)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            This is an automated analysis report generated by Invobook. Confidential.
          </div>
        </body>
      </html>
    `;

    let browser = null;
    try {
      browser = await getBrowser();
      const page = await browser.newPage();
      await page.setContent(fullHtml, { waitUntil: 'load', timeout: 30000 });
      await page.evaluate(async () => {
        await document.fonts.ready;
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          bottom: '20px',
          left: '20px',
          right: '20px'
        }
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoices-analysis-report-${Date.now()}.pdf"`);
      return res.status(200).send(pdfBuffer);
    } finally {
      if (browser) await browser.close();
    }

  } catch (error) {
    console.error('Error generating analysis PDF:', error);
    return res.status(500).json({ message: 'An internal server error occurred.', details: error.message });
  }
}
