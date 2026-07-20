import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Download, Edit3, User, Calendar, CreditCard, Copy, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const InvoiceDrawer = ({ isOpen, onClose, invoiceId, onEditInvoice, onDownloadPDF, currency = 'USD' }) => {
  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && invoiceId) {
      fetchInvoice(invoiceId);
    } else {
      setInvoice(null);
    }
  }, [isOpen, invoiceId]);

  const fetchInvoice = async (id) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/invoices/${id}`);
      if (res.ok) {
        const data = await res.json();
        setInvoice(data);
      } else {
        toast('Failed to load invoice details.');
      }
    } catch (error) {
      console.error(error);
      toast('An error occurred while loading invoice details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleCopyLink = () => {
    if (!invoice) return;
    const link = `${window.location.origin}/share/${invoice.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast('Sharing link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount || 0);
  };

  if (!isOpen && !isClosing) return null;
  if (!mounted) return null;

  const getStatusColor = (status) => {
    switch(status) {
      case 'PAID': return 'ds-status-paid';
      case 'PENDING': return 'ds-status-pending';
      case 'OVERDUE': return 'ds-status-overdue';
      case 'PARTIALLY_PAID': return 'ds-status-partial';
      default: return 'ds-status-draft';
    }
  };

  const drawerContent = (
    <div className="fixed inset-0 z-[9999] flex justify-end">
      {/* Backdrop overlay */}
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />
      
      {/* Right Drawer */}
      <div 
        className={`relative w-full max-w-[500px] h-full bg-[var(--ds-white)] border-l border-[#eaeaea] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isClosing ? 'translate-x-full' : 'translate-x-0'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-[#eaeaea]">
          <div>
            <h2 className="text-xl font-semibold text-[var(--ds-black)]">
              {invoice ? invoice.invoiceNumber : 'Invoice Details'}
            </h2>
            {invoice && (
              <div className="flex items-center gap-2 mt-2">
                <span className={`ds-status ${getStatusColor(invoice.status)} text-xs`}>
                  {invoice.status}
                </span>
                <span className="text-xs text-[var(--ds-gray-500)]">
                  {new Date(invoice.date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
          <button onClick={handleClose} className="ds-icon-btn rounded-full hover:bg-[var(--ds-gray-100)] p-2">
            <X className="w-5 h-5 text-[var(--ds-gray-500)]" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {isLoading || !invoice ? (
            <div className="p-6 flex flex-col items-center justify-center h-full text-[var(--ds-gray-400)] space-y-4">
              <div className="w-8 h-8 rounded-full border-2 border-t-[var(--ds-black)] animate-spin border-[#eaeaea]"></div>
              <p className="text-sm font-medium">Loading Invoice Data...</p>
            </div>
          ) : (
            <div className="p-6 space-y-8">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="ds-card-static p-4 flex flex-col bg-[var(--ds-gray-50)] border border-[#eaeaea]">
                  <span className="text-xs font-semibold uppercase text-[var(--ds-gray-500)] mb-1">Total Amount</span>
                  <span className="text-2xl font-bold text-[var(--ds-black)]">{formatCurrency(invoice.total)}</span>
                </div>
                
                <div className="ds-card-static p-4 flex flex-col border border-[#eaeaea]">
                  <span className="text-xs font-semibold uppercase text-[var(--ds-gray-500)] mb-1">Balance Due</span>
                  <span className={`text-2xl font-bold ${Number(invoice.balanceDue) > 0 ? 'text-[var(--ds-ship-red)]' : 'text-emerald-600'}`}>
                    {formatCurrency(invoice.balanceDue)}
                  </span>
                </div>
              </div>

              {/* Customer Details */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--ds-black)] flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-[var(--ds-gray-500)]" /> Billed To
                </h3>
                <div className="ds-card-static p-4 border border-[#eaeaea] text-sm">
                  <p className="font-semibold text-[var(--ds-black)] mb-1">{invoice.client?.name || 'Unknown Client'}</p>
                  {invoice.client?.company && <p className="text-[var(--ds-gray-600)] mb-1">{invoice.client.company}</p>}
                  {invoice.client?.email && <p className="text-[var(--ds-gray-600)] mb-1">{invoice.client.email}</p>}
                  {invoice.client?.phone && <p className="text-[var(--ds-gray-600)] mb-1">{invoice.client.phone}</p>}
                  {invoice.client?.address && (
                    <p className="text-[var(--ds-gray-600)] mb-1">
                      {invoice.client.address}
                      {invoice.client?.city ? `, ${invoice.client.city}` : ''}
                    </p>
                  )}
                  {invoice.client?.taxId && <p className="text-[var(--ds-gray-500)] text-xs mt-2">Tax ID: {invoice.client.taxId}</p>}
                </div>
              </div>

              {/* Dates & Payment */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--ds-black)] flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-[var(--ds-gray-500)]" /> Important Dates
                </h3>
                <div className="ds-card-static divide-y divide-[#eaeaea] border border-[#eaeaea]">
                  <div className="p-3 flex justify-between items-center text-sm">
                    <span className="text-[var(--ds-gray-500)]">Issue Date</span>
                    <span className="font-medium text-[var(--ds-black)]">{new Date(invoice.date).toLocaleDateString()}</span>
                  </div>
                  <div className="p-3 flex justify-between items-center text-sm">
                    <span className="text-[var(--ds-gray-500)]">Due Date</span>
                    <span className={`font-medium ${new Date(invoice.dueDate) < new Date() && invoice.status !== 'PAID' ? 'text-[var(--ds-ship-red)]' : 'text-[var(--ds-black)]'}`}>
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Line Items Preview */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--ds-black)] flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4 text-[var(--ds-gray-500)]" /> Items Summary
                </h3>
                <div className="ds-card-static divide-y divide-[#eaeaea] border border-[#eaeaea]">
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="p-3 flex justify-between items-start text-sm">
                        <div className="flex flex-col pr-4">
                          <span className="font-medium text-[var(--ds-black)]">{item.description || 'Item'}</span>
                          <span className="text-xs text-[var(--ds-gray-500)] mt-0.5">{item.quantity} x {formatCurrency(item.rate)}</span>
                        </div>
                        <span className="font-medium text-[var(--ds-black)]">{formatCurrency(item.amount)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-[var(--ds-gray-500)]">No items found.</div>
                  )}
                  {invoice.items && invoice.items.length > 3 && (
                    <div className="p-3 text-center text-xs font-medium text-[var(--ds-gray-500)] bg-[var(--ds-gray-50)] rounded-b-lg">
                      + {invoice.items.length - 3} more item(s)
                    </div>
                  )}
                  <div className="p-3 flex justify-between items-center text-sm bg-[var(--ds-gray-50)] font-semibold rounded-b-lg">
                    <span className="text-[var(--ds-black)]">Total</span>
                    <span className="text-[var(--ds-black)]">{formatCurrency(invoice.total)}</span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer Actions */}
        {invoice && (
          <div className="flex-shrink-0 p-6 border-t border-[#eaeaea] bg-[var(--ds-white)]">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button 
                onClick={handleCopyLink}
                className="ds-btn-ghost flex-1 justify-center gap-2 h-10 border border-[#eaeaea]"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Share Link'}</span>
              </button>
              <button 
                onClick={() => {
                  onDownloadPDF(invoice.id);
                  toast('Downloading PDF...');
                }}
                className="ds-btn-ghost flex-1 justify-center gap-2 h-10 border border-[#eaeaea]"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
            <button 
              onClick={() => {
                handleClose();
                onEditInvoice(invoice.id);
              }}
              className="ds-btn-dark w-full justify-center gap-2 h-10"
            >
              <Edit3 className="w-4 h-4" /> Full Edit & Details
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
};

export default InvoiceDrawer;
