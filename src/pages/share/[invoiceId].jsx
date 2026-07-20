import { useState } from 'react';
import Head from 'next/head';
import prisma from '../../lib/prisma';
import { Download, Calendar, FileText, CreditCard, UploadCloud, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export async function getServerSideProps(context) {
  const { invoiceId } = context.params;

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: { select: { name: true, company: true } },
        user: {
          select: {
            name: true,
            business: {
              select: {
                businessName: true,
                logoUrl: true,
                invoiceSettings: {
                  select: {
                    paymentInfo: true,
                    paymentImageUrl: true,
                  },
                },
              },
            },
          },
        },
        items: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!invoice) {
      return { notFound: true };
    }

    const formatCurrency = (amount) => {
      const num = parseFloat(amount);
      if (isNaN(num)) return 'Rs. 0';
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'NPR' }).format(num);
    };

    return {
      props: {
        invoice: {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          date: invoice.date.toISOString(),
          dueDate: invoice.dueDate.toISOString(),
          status: invoice.status,
          total: formatCurrency(invoice.total),
          balanceDue: formatCurrency(invoice.balanceDue),
          totalRaw: Number(invoice.total),
          balanceDueRaw: Number(invoice.balanceDue),
          itemCount: invoice.items?.length || 0,
          clientName: invoice.client?.company || invoice.client?.name || 'Client',
          businessName: invoice.user?.business?.businessName || 'Business',
          businessLogo: invoice.user?.business?.logoUrl || null,
          paymentInfo: invoice.user?.business?.invoiceSettings?.paymentInfo || null,
          paymentImageUrl: invoice.user?.business?.invoiceSettings?.paymentImageUrl || null,
          latestPaymentStatus: invoice.payments?.[0]?.status || null,
        },
      },
    };
  } catch (error) {
    console.error('Share page error:', error);
    return { notFound: true };
  }
}

export default function ShareInvoicePage({ invoice }) {
  const [showPayForm, setShowPayForm] = useState(false);
  const [amount, setAmount] = useState(invoice.balanceDueRaw.toString());
  const [method, setMethod] = useState('qr_code');
  const [referenceNo, setReferenceNo] = useState('');
  const [proofImageUrl, setProofImageUrl] = useState('');
  const [note, setNote] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const formattedDate = new Date(invoice.date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const formattedDueDate = new Date(invoice.dueDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    setUploadError('');
    try {
      const response = await fetch(`/api/avatar-upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      });
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      const data = await response.json();
      setProofImageUrl(data.url);
    } catch (err) {
      setUploadError('Failed to upload screenshot. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage('Please enter a valid payment amount.');
      return;
    }

    if (method === 'qr_code' && !proofImageUrl) {
      setErrorMessage('Please upload a screenshot of your payment proof.');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await fetch(`/api/share/${invoice.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          method,
          referenceNo,
          proofImageUrl,
          note,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Payment submission failed.');
      
      setSubmitSuccess(true);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ogTitle = `Invoice ${invoice.invoiceNumber} from ${invoice.businessName}`;
  const ogDescription = `Amount: ${invoice.total} • Due: ${formattedDueDate} • ${invoice.itemCount} item(s)`;
  const ogImage = invoice.businessLogo || `https://placehold.co/1200x630/1e293b/ffffff?text=${encodeURIComponent(invoice.businessName)}`;

  return (
    <>
      <Head>
        <title>{ogTitle}</title>
        <meta name="description" content={ogDescription} />

        {/* Open Graph — WhatsApp, Facebook, LinkedIn */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content={ogImage} />
      </Head>

      <div className="min-h-screen bg-[var(--ds-gray-50)] flex flex-col items-center justify-center p-6" style={{ fontFamily: 'var(--ds-font-sans)' }}>
        <div className="w-full max-w-[480px] bg-[var(--ds-white)] rounded-[var(--ds-radius-card)] overflow-hidden" style={{ boxShadow: 'var(--ds-shadow-card-full)' }}>
          {/* Header Banner */}
          <div className="bg-[var(--ds-black)] text-[var(--ds-white)] p-8 text-center flex flex-col items-center justify-center gap-3 relative">
            {invoice.businessLogo ? (
              <div className="w-14 h-14 bg-white rounded-[var(--ds-radius-image)] flex items-center justify-center overflow-hidden p-1 shadow-sm">
                <img
                  src={invoice.businessLogo}
                  alt={invoice.businessName}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-[var(--ds-gray-100)] text-[var(--ds-black)] rounded-full flex items-center justify-center font-bold text-lg">
                {invoice.businessName.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-[var(--ds-white)] m-0">{invoice.businessName}</h1>
              <p className="text-xs text-[var(--ds-gray-400)] font-medium mt-1">Invoice {invoice.invoiceNumber}</p>
            </div>
          </div>

          {/* Main Card Body */}
          <div className="p-8">
            {submitSuccess ? (
              <div className="text-center py-6 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[rgba(5,150,105,0.1)] text-[#059669] flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--ds-black)] m-0">Payment Details Submitted</h2>
                  <p className="text-sm text-[var(--ds-gray-500)] mt-2 leading-relaxed">
                    Your proof of transaction has been uploaded successfully. The merchant will verify and update your invoice shortly.
                  </p>
                </div>
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="ds-btn-dark w-full mt-4 flex items-center justify-center"
                  style={{ height: '38px', lineHeight: '38px' }}
                >
                  Done
                </button>
              </div>
            ) : showPayForm ? (
              <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-[var(--ds-gray-100)] pb-4 mb-2">
                  <h3 className="text-base font-semibold text-[var(--ds-black)] m-0 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[var(--ds-gray-500)]" />
                    Submit Payment
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowPayForm(false)}
                    className="text-sm font-medium text-[var(--ds-gray-500)] hover:text-[var(--ds-black)] transition-colors bg-transparent border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                {errorMessage && (
                  <div className="flex gap-2.5 p-4 rounded-[var(--ds-radius-button)] bg-[rgba(255,91,79,0.06)] text-[var(--ds-ship-red)] text-sm font-medium border border-[rgba(255,91,79,0.1)]">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Merchant payment instructions */}
                {(invoice.paymentInfo || invoice.paymentImageUrl) && (
                  <div className="p-4 rounded-[var(--ds-radius-card)] bg-[var(--ds-gray-50)] border border-[var(--ds-gray-100)] text-sm">
                    <h4 className="font-semibold text-[var(--ds-black)] mb-2">Payment Instructions</h4>
                    {invoice.paymentInfo && (
                      <p className="text-[var(--ds-gray-600)] m-0 whitespace-pre-wrap leading-relaxed">
                        {invoice.paymentInfo}
                      </p>
                    )}
                    {invoice.paymentImageUrl && (
                      <div className="mt-4 flex flex-col items-center justify-center p-3 bg-[var(--ds-white)] rounded-[var(--ds-radius-button)] border border-[var(--ds-gray-100)] max-w-[200px] mx-auto">
                        <img
                          src={invoice.paymentImageUrl}
                          alt="Payment QR Code"
                          className="w-full h-auto object-contain rounded"
                        />
                        <span className="text-[10px] text-[var(--ds-gray-400)] font-medium tracking-wider uppercase mt-2">Scan to Pay</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="ds-form-label">Amount to Pay (NPR)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="ds-input"
                    style={{ height: '38px' }}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="ds-form-label">Payment Method</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="ds-select w-full"
                    style={{ height: '38px', lineHeight: '38px' }}
                  >
                    <option value="qr_code">Pay via QR</option>
                  </select>
                </div>


                <div className="flex flex-col gap-1.5">
                  <label className="ds-form-label">Payment Proof (Screenshot)</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <label className="ds-btn-ghost cursor-pointer flex items-center justify-center gap-2" style={{ height: '36px', padding: '0 14px' }}>
                        <UploadCloud className="w-4 h-4 text-[var(--ds-gray-500)]" />
                        <span className="text-xs font-semibold">Choose File</span>
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                      
                      {isUploading && (
                        <div className="flex items-center gap-2 text-xs text-[var(--ds-gray-500)] font-medium">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </div>
                      )}
                      
                      {proofImageUrl && !isUploading && (
                        <span className="text-xs text-[#059669] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                        </span>
                      )}
                    </div>
                    {uploadError && <span className="text-xs text-[var(--ds-ship-red)] font-medium">{uploadError}</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="ds-form-label">Note (Optional)</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    placeholder="Any message for the merchant..."
                    className="ds-input resize-none py-2"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="ds-btn-dark w-full mt-2 flex items-center justify-center gap-2"
                  style={{ height: '40px', opacity: (isSubmitting || isUploading) ? 0.7 : 1 }}
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm Payment'}
                </button>
              </form>
            ) : (
              <>
                {/* Summary / Amount Due */}
                <div className="text-center mb-8 flex flex-col items-center justify-center gap-2.5">
                  <span className="text-xs font-semibold text-[var(--ds-gray-400)] tracking-wider uppercase">Amount Due</span>
                  <span className="text-3xl font-bold tracking-tight text-[var(--ds-black)]">{invoice.balanceDue}</span>
                  <div>
                    <span className={`ds-status ${
                      invoice.status === 'PAID' ? 'ds-status-paid' : invoice.status === 'OVERDUE' ? 'ds-status-overdue' : 'ds-status-pending'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        invoice.status === 'PAID' ? 'bg-[#059669]' : invoice.status === 'OVERDUE' ? 'bg-[var(--ds-ship-red)]' : 'bg-[var(--ds-badge-text)]'
                      }`}></span>
                      {invoice.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Details Table */}
                <div className="border-t border-[var(--ds-gray-100)] pt-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--ds-gray-400)] uppercase tracking-wider">Client</span>
                    <span className="text-sm font-medium text-[var(--ds-black)]">{invoice.clientName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--ds-gray-400)] uppercase tracking-wider">Invoice Date</span>
                    <span className="text-sm font-medium text-[var(--ds-black)]">{formattedDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--ds-gray-400)] uppercase tracking-wider">Due Date</span>
                    <span className="text-sm font-medium text-[var(--ds-black)]">{formattedDueDate}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-[var(--ds-gray-100)] pt-4">
                    <span className="text-xs font-semibold text-[var(--ds-gray-400)] uppercase tracking-wider">Total Amount</span>
                    <span className="text-sm font-bold text-[var(--ds-black)]">{invoice.total}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 mt-8">
                  {invoice.status === 'PAID' ? (
                    <div className="flex items-center justify-center gap-2 p-3 bg-[rgba(5,150,105,0.1)] text-[#059669] rounded-[var(--ds-radius-button)] text-sm font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      Payment Received in Full
                    </div>
                  ) : invoice.latestPaymentStatus === 'pending' ? (
                    <div className="flex flex-col items-center justify-center gap-1.5 p-3 bg-[rgba(245,158,11,0.1)] text-[#d97706] rounded-[var(--ds-radius-button)] text-sm font-semibold border border-[rgba(245,158,11,0.2)]">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Payment Verification Pending
                      </div>
                      <span className="text-xs font-normal text-center mt-1">
                        We are currently reviewing your submitted payment proof.
                      </span>
                    </div>
                  ) : (
                    <>
                      {invoice.latestPaymentStatus === 'rejected' && (
                        <div className="flex flex-col items-center justify-center gap-1.5 p-3 bg-[rgba(255,91,79,0.06)] text-[var(--ds-ship-red)] rounded-[var(--ds-radius-button)] text-sm font-semibold border border-[rgba(255,91,79,0.1)] mb-1">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Payment Rejected
                          </div>
                          <span className="text-xs font-normal text-center mt-1">
                            Your previous payment proof was not accepted. Please try again.
                          </span>
                        </div>
                      )}
                      {invoice.latestPaymentStatus === 'verified' && invoice.status === 'PARTIALLY_PAID' && (
                        <div className="flex flex-col items-center justify-center gap-1.5 p-3 bg-[rgba(5,150,105,0.1)] text-[#059669] rounded-[var(--ds-radius-button)] text-sm font-semibold border border-[rgba(5,150,105,0.2)] mb-1">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Partial Payment Verified
                          </div>
                          <span className="text-xs font-normal text-center mt-1">
                            Your recent payment was accepted. You can pay the remaining balance below.
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => setShowPayForm(true)}
                        className="ds-btn-dark w-full flex items-center justify-center gap-2"
                        style={{ height: '40px' }}
                      >
                        <CreditCard className="w-4 h-4" />
                        {invoice.status === 'PARTIALLY_PAID' ? 'Pay Remaining Balance' : 'Pay Now'}
                      </button>
                    </>
                  )}

                  <a
                    href={`/api/downloadInvoice/${invoice.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ds-btn-ghost w-full flex items-center justify-center gap-2 no-underline"
                    style={{ height: '40px', lineHeight: '40px' }}
                  >
                    <Download className="w-4 h-4" />
                    Download Invoice PDF
                  </a>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="bg-[var(--ds-gray-50)] border-t border-[var(--ds-gray-100)] py-4 text-center text-[10px] font-semibold text-[var(--ds-gray-400)] uppercase tracking-widest">
            Powered by Invobook
          </div>
        </div>
      </div>
    </>
  );
}

// Render without the dashboard sidebar layout
ShareInvoicePage.getLayout = (page) => page;

