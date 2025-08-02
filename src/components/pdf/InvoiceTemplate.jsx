import React from 'react';

// Helper for formatting currency.
const formatCurrency = (amount, currency = 'INR') => {
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount)) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(0);
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(numericAmount);
};

// Helper for formatting dates
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const InvoiceTemplate = ({ invoiceData }) => {
  const { business, client, invoice, user } = invoiceData;

  // Safety check remains crucial
  if (!invoice || !client || !business || !user) {
    return <div>Error: Missing invoice data.</div>;
  }

  const discountLabel = invoice.discountType === 'PERCENTAGE'
    ? `Discount (${invoice.discountValue.toString()}%)`
    : `Discount (${formatCurrency(invoice.discountValue, business.currency || 'INR')})`;

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{`Invoice #${invoice.invoiceNumber}`}</title>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            /* --- Base Styles --- */
            html, body {
              height: 100%; /* Needed for the sticky footer layout */
              font-family: 'Inter', sans-serif; 
              background-color: #ffffff;
              color: #334155;
              font-size: 12px;
              line-height: 1.5;
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            *, *:before, *:after {
              box-sizing: inherit;
            }

            /* --- Layout --- */
            .invoice-box {
              display: flex; /* Enables flexbox */
              flex-direction: column; /* Stacks children vertically */
              height: 100%; /* Takes full page height */
              max-width: 800px;
              margin: auto;
              padding: 24px;
              border: 1px solid #e2e8f0;
            }
            .content-wrap {
              flex-grow: 1; /* This is the magic that pushes the footer down */
            }

            /* --- Typography --- */
            p { margin: 0 0 4px 0; }
            strong { font-weight: 600; }
            h1 { font-size: 24px; font-weight: 700; color: #1e293b; margin: 0; }
            h2 { font-size: 14px; font-weight: 700; margin: 0; }
            h3 { font-size: 13px; font-weight: 700; margin: 0; }

            /* --- Table Styles --- */
            .invoice-table { width: 100%; border-collapse: collapse; text-align: left; }
            .invoice-table th, .invoice-table td {
              padding: 6px; /* Reduced padding */
              font-size: 13px; /* Reduced font size for table items */
            }
            .invoice-table thead { background-color: #f1f5f9; padding-top: 2px; }
            .invoice-table thead th { font-weight: 600; color: #1e293b; }
            .invoice-table tbody tr { border-bottom: 1px solid #e2e8f0; }

            /* --- Utility --- */
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
              {business.logoUrl && <img src={business.logoUrl} alt="Business Logo" style={{ maxWidth: '120px', marginBottom: '8px' }} />}
              <h2>{business.businessName}</h2>
              <p>{business.address}</p>
              <p>{business.city}, {business.state} - {business.zipCode}</p>
              {business.taxId && <p style={{ marginTop: '4px' }}><strong>GSTIN:</strong> {business.taxId}</p>}
            </div>
          </header>

          <div style={{ paddingBottom: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#64748b', fontWeight: 500 }}>Billed To</p>
              <h3>{client.company || client.name}</h3>
              <p>{client.address}</p>
              <p>{client.city}, India</p>
              {client.taxId && <p style={{ marginTop: '8px' }}><strong>GSTIN:</strong> {client.taxId}</p>}
            </div>
            <div className="text-right" style={{ minWidth: '220px' }}>
              <div style={{ marginBottom: '12px' }}>
                <p><strong>Invoice #:</strong> {invoice.invoiceNumber}</p>
                <p><strong>Invoice Date:</strong> {formatDate(invoice.date)}</p>
                <p><strong>Due Date:</strong> {formatDate(invoice.dueDate)}</p>
              </div>
              <div>
                 <p style={{ color: '#64748b', fontWeight: 500 }}>Payment Details</p>
                 <p><strong>Paid:</strong> {formatCurrency(invoice.amountPaid, business.currency)}</p>
                 <p style={{ fontSize: '14px', fontWeight: 700, color: '#1d4ed8' }}>
                    <strong>Balance Due:</strong> {formatCurrency(invoice.balanceDue, business.currency)}
                 </p>
              </div>
            </div>
          </div>
          
          {/* This main content wrapper will grow to push the footer down */}
          <main className="content-wrap">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{ width: '10%' }}>Qty</th>
                  <th style={{ width: '20%' }}>Rate</th>
                  <th className="text-right" style={{ width: '20%' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.description}</td>
                    <td>{item.quantity.toString()}</td>
                    <td>{formatCurrency(item.rate, business.currency)}</td>
                    <td className="text-right">{formatCurrency(item.amount, business.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <div style={{ width: '45%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 500 }}>Subtotal</span>
                  <span>{formatCurrency(invoice.subtotal, business.currency)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 500 }}>{discountLabel}</span>
                  <span>-{formatCurrency(invoice.discountAmount, business.currency)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 500 }}>Shipping</span>
                  <span>{formatCurrency(invoice.shippingCost, business.currency)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 500 }}>Tax ({invoice.taxRate.toString()}%)</span>
                  <span>{formatCurrency(invoice.taxAmount, business.currency)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '15px', borderTop: '2px solid #e2e8f0', paddingTop: '12px' }}>
                  <span>Total</span>
                  <span>{formatCurrency(invoice.total, business.currency)}</span>
                </div>
              </div>
            </div>
          </main>
          
          <footer style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', color: '#64748b', fontSize: '11px' }}>
              {invoice.notes && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Notes</p>
                  <p>{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <p style={{ fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Terms & Conditions</p>
                  <p>{invoice.terms}</p>
                </div>
              )}
              <p style={{ marginTop: '24px', textAlign: 'center' }}>
                For any enquiries, please email <strong>{user.email}</strong> or call <strong>{business.phone}</strong>
              </p>
          </footer>

        </div>
      </body>
    </html>
  );
};