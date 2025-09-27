import React from 'react';

// --- Helper Functions ---
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

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// --- The Redesigned Classic Invoice Template ---
export const ClassicTemplate = ({ invoiceData }) => {
    const { business, client, invoice, user } = invoiceData;

    if (!invoice || !client || !business || !user) {
        return (
            <html><body><div>Error: Missing essential invoice data.</div></body></html>
        );
    }
    
    const discountLabel = invoice.discountType === 'PERCENTAGE'
        ? `Discount (${invoice.discountValue.toString()}%)`
        : 'Discount';
    
    const getStatusStyles = (status) => {
        switch (status) {
            case 'PAID': return { backgroundColor: '#28a745', color: '#ffffff' };
            case 'OVERDUE': return { backgroundColor: '#dc3545', color: '#ffffff' };
            case 'PENDING': return { backgroundColor: '#ffc107', color: '#212529' };
            default: return { backgroundColor: '#6c757d', color: '#ffffff' };
        }
    };
    const statusStyles = getStatusStyles(invoice.status);

    return (
        <html lang="en">
            <head>
                <meta charSet="UTF-8" />
                <title>{`Invoice #${invoice.invoiceNumber}`}</title>
                <style>
                  {`
                    @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap');
                    
                    html, body { 
                      font-family: 'Merriweather', 'Times New Roman', serif; 
                      background-color: #ffffff; 
                      color: #343a40; 
                      font-size: 12px;
                      line-height: 1.7; 
                      margin: 0; 
                      padding: 0; 
                    }
                    .invoice-box { 
                      max-width: 800px; 
                      margin: auto; 
                      padding: 40px;
                      display: flex; 
                      flex-direction: column; 
                      min-height: 100vh;
                      box-sizing: border-box;
                    }
                    .content-wrap { flex-grow: 1; }
                    p { margin: 0 0 6px 0; }
                    b { font-weight: 700; color: #000; }
                    h1 { font-size: 16px; font-weight: 700; color: #000; margin: 0; }
                    
                    table { width: 100%; border-collapse: collapse; text-align: left; }
                    th, td { padding: 12px; }
                    thead { border-bottom: 2px solid #000; }
                    thead th { font-weight: 700; color: #000; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; }
                    tbody tr { border-bottom: 1px solid #dee2e6; }
                    tbody td { font-size: 12px; color: #495057; }

                    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 50px; }
                    .header-left { width: 48%; }
                    .header-right { width: 48%; text-align: right; }

                    .totals-section { display: flex; justify-content: flex-end; margin-top: 24px; }
                    .totals-summary { width: 50%; }
                    .summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
                    
                    /* Styles for the relocated Balance Due box */
                    .balance-due-box { background-color: #212529; color: #ffffff; padding: 12px; margin-top: 20px; }
                    .balance-due-box p { margin: 0; font-size: 14px; font-weight: 700; }

                    .text-right { text-align: right; }
                  `}
                </style>
            </head>
            <body>
                <div className="invoice-box">
                    <header className="header">
                        {/* --- LEFT COLUMN: Your Business Details & Balance Due --- */}
                        <div className="header-left">
                                {/* --- FIX: Always show logo if it exists --- */}
                            {business.logoUrl && (
                                <img src={business.logoUrl} alt="Business Logo" style={{ maxWidth: '160px', height: 'auto', marginBottom: '16px' }} />
                            )}
                            {/* --- FIX: Always show business name --- */}
                            <h1 style={{ marginBottom: '12px' }}>{business.businessName}</h1>
                            <p>{business.address}</p>
                            <p>{business.city}, {business.state} - {business.zipCode}</p>
                            {business.taxId && <p><b>PAN:</b> {business.taxId}</p>}

                           
                        </div>

                        {/* --- RIGHT COLUMN: Client and Invoice Details --- */}
                        <div className="header-right">
                            <div style={{ display: 'inline-block', padding: '6px 16px', ...statusStyles, marginBottom: '20px' }}>
                                <p style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: 'inherit', letterSpacing: '1px' }}>
                                    INVOICE {invoice.status}
                                </p>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <p><b>Invoice #:</b> {invoice.invoiceNumber}</p>
                                <p><b>Invoice Date:</b> {formatDate(invoice.date)}</p>
                                <p><b>Due Date:</b> {formatDate(invoice.dueDate)}</p>
                            </div>
                            
                            <div style={{ borderTop: '1px solid #dee2e6', paddingTop: '20px' }}>
                                <p style={{ color: '#868e96' }}>Billed To:</p>
                                <p><b>{client.company || client.name}</b></p>
                                <p>{client.address}</p>
                                <p>{client.city}</p>
                                {client.phone && <p>{client.phone}</p>}
                                {client.taxId && <p><b>PAN:</b> {client.taxId}</p>}
                            </div>
 {/* --- RELOCATED BALANCE DUE BOX --- */}
                            <div className="balance-due-box">
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <p>Balance Due:</p>
                                    <p>{formatCurrency(invoice.balanceDue, business.currency)}</p>
                                </div>
                            </div>

                        </div>
                    </header>

                    <main className="content-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th className="text-right" style={{width: '10%'}}>Qty</th>
                                    <th className="text-right" style={{width: '20%'}}>Rate</th>
                                    <th className="text-right" style={{width: '20%'}}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.description}</td>
                                        <td className="text-right">{item.quantity.toString()}</td>
                                        <td className="text-right">{formatCurrency(item.rate, business.currency)}</td>
                                        <td className="text-right">{formatCurrency(item.amount, business.currency)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="totals-section">
                            <div className="totals-summary">
                                <div className="summary-row"><span>Subtotal:</span><span>{formatCurrency(invoice.subtotal, business.currency)}</span></div>
                                {invoice.discountAmount > 0 && <div className="summary-row"><span>{discountLabel}:</span><span>-{formatCurrency(invoice.discountAmount, business.currency)}</span></div>}
                                {invoice.shippingCost > 0 && <div className="summary-row"><span>Shipping:</span><span>{formatCurrency(invoice.shippingCost, business.currency)}</span></div>}
                                {invoice.taxAmount > 0 && <div className="summary-row"><span>Tax ({invoice.taxRate.toString()}%):</span><span>{formatCurrency(invoice.taxAmount, business.currency)}</span></div>}
                                
                                <div className="summary-row" style={{ borderTop: '2px solid #000', marginTop: '8px', paddingTop: '8px' }}>
                                    <b>Grand Total:</b>
                                    <b>{formatCurrency(invoice.total, business.currency)}</b>
                                </div>
                                <div className="summary-row">
                                    <span>Amount Paid:</span>
                                    <span>-{formatCurrency(invoice.amountPaid, business.currency)}</span>
                                </div>
                            </div>
                        </div>
                    </main>

                    <footer style={{ borderTop: '1px solid #dee2e6', paddingTop: '20px', marginTop: '40px', fontSize: '11px', color: '#868e96' }}>
                        {invoice.notes && <div style={{ marginBottom: '15px' }}><b>Notes:</b><p>{invoice.notes}</p></div>}
                        {invoice.terms && <div><b>Terms & Conditions:</b><p>{invoice.terms}</p></div>}
                        <p style={{ textAlign: 'center', marginTop: '30px' }}>Thank you! For any questions, please contact <strong>{user.email}</strong> or <strong>{business.phone}</strong>.</p>
                    </footer>
                </div>
            </body>
        </html> 
    );
};