import React from 'react';

// You can create a shared `utils/formatters.js` file for these helpers
const formatCurrency = (amount, currency = 'INR') => {
  // ... (same as your original code)
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount)) return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(0);
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(numericAmount);
};
const formatDate = (dateString) => {
  // ... (same as your original code)
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const ModernGreenTemplate = ({ invoiceData }) => {
  const { business, client, invoice, user } = invoiceData;

  if (!invoice || !client || !business || !user) {
    return <div>Error: Missing invoice data.</div>;
  }

  const discountLabel = invoice.discountType === 'PERCENTAGE' ? `Discount (${invoice.discountValue.toString()}%)` : 'Discount';

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <title>{`Invoice #${invoice.invoiceNumber}`}</title>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            html, body { font-family: 'Inter', sans-serif; background-color: #ffffff; color: #334155; font-size: 12px; line-height: 1.5; margin: 0; padding: 0; box-sizing: border-box; }
            *, *:before, *:after { box-sizing: inherit; }
            .invoice-box { display: flex; flex-direction: column; height: 100%; max-width: 800px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; }
            .content-wrap { flex-grow: 1; }
            p { margin: 0 0 4px 0; }
            strong { font-weight: 600; }
            h1, h2, h3 { font-weight: 700; margin: 0; color: #1e293b; }
            h1 { font-size: 24px; } h2 { font-size: 14px; } h3 { font-size: 13px; }
            .invoice-table { width: 100%; border-collapse: collapse; text-align: left; }
            .invoice-table th, .invoice-table td { padding: 8px; font-size: 13px; }
            .invoice-table thead { background-color: #f0fdf4; } /* Green theme background */
            .invoice-table thead th { font-weight: 600; color: #065f46; } /* Green theme color */
            .invoice-table tbody tr { border-bottom: 1px solid #e2e8f0; }
            .text-right { text-align: right; }
          `}
        </style>
      </head>
      <body>
        <div className="invoice-box">
          <header style={{ paddingBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
             <div>
              <h1>INVOICE {invoice.invoiceNumber}</h1>
              <div style={{
                marginTop: '8px', padding: '4px 12px', borderRadius: '9999px', display: 'inline-block',
                textTransform: 'uppercase', fontWeight: 600, fontSize: '10px',
                backgroundColor: invoice.status === 'PAID' ? '#dcfce7' : '#fee2e2',
                color: invoice.status === 'PAID' ? '#166534' : '#991b1b'
              }}>
                {invoice.status}
              </div>
            </div>
            <div className="text-right">
              {business.logoUrl && <img src={business.logoUrl} alt="Logo" style={{ maxWidth: '120px', marginBottom: '8px' }} />}
              <h2>{business.businessName}</h2>
              <p>{business.address}</p>
              {business.taxId && <p><strong>GSTIN:</strong> {business.taxId}</p>}
            </div>
          </header>

          <div style={{ padding: '24px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <p style={{ color: '#64748b' }}>Billed To</p>
              <h3>{client.company || client.name}</h3>
              <p>{client.address}</p>
              {client.taxId && <p><strong>GSTIN:</strong> {client.taxId}</p>}
            </div>
            <div className="text-right">
              <p><strong>Invoice Date:</strong> {formatDate(invoice.date)}</p>
              <p><strong>Due Date:</strong> {formatDate(invoice.dueDate)}</p>
              <p style={{ fontSize: '16px', fontWeight: 700, color: '#047857', marginTop: '12px' }}> {/* Green theme color */}
                Balance Due: {formatCurrency(invoice.balanceDue, business.currency)}
              </p>
            </div>
          </div>

          <main className="content-wrap">
            <table className="invoice-table">
              <thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th className="text-right">Amount</th></tr></thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={idx}><td>{item.description}</td><td>{item.quantity.toString()}</td><td>{formatCurrency(item.rate, business.currency)}</td><td className="text-right">{formatCurrency(item.amount, business.currency)}</td></tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <div style={{ width: '45%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span>Subtotal</span><span>{formatCurrency(invoice.subtotal, business.currency)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span>{discountLabel}</span><span>-{formatCurrency(invoice.discountAmount, business.currency)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><span>Tax ({invoice.taxRate.toString()}%)</span><span>{formatCurrency(invoice.taxAmount, business.currency)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '15px', borderTop: '2px solid #6ee7b7', paddingTop: '12px' }}> {/* Green theme color */}
                  <span>Total</span><span>{formatCurrency(invoice.total, business.currency)}</span>
                </div>
              </div>
            </div>
          </main>
          
          <footer style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', color: '#64748b' }}>
            {invoice.notes && <p><strong>Notes:</strong> {invoice.notes}</p>}
            <p style={{ textAlign: 'center', marginTop: '16px' }}>Thank you for your business!</p>
          </footer>
        </div>
      </body>
    </html>
  );
};