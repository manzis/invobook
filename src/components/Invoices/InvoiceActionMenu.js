import React, { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { createPortal } from 'react-dom';
import {
  Edit,
  Download,
  Trash2,
  CheckCircle,
  MoreVertical,
  Mail,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  XCircle,
  Share,
  ArrowLeft,
  Loader2,
  CreditCard,
} from 'lucide-react';
import { formatCurrency, CURRENCY_SYMBOLS } from '../../utils/InvoicesUtils';
import { useToast } from '../../context/ToastContext';

const LoaderOverlay = () => (
  <div
    className="fixed inset-0 flex items-center justify-center transition-opacity duration-300"
    style={{ zIndex: 1000, background: 'rgba(23, 23, 23, 0.4)' }}
  >
    <div className="flex flex-col items-center space-y-3">
      <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--ds-white)' }} />
      <span className="text-lg font-medium" style={{ color: 'var(--ds-white)' }}>
        Preparing to share...
      </span>
    </div>
  </div>
);

const InvoiceActionMenu = ({
  invoice,
  currency = 'USD',
  onEditInvoice,
  onDeleteInvoice,
  onUpdateInvoiceState,
  align = 'end',
  triggerButton,
}) => {
  const { toast } = useToast();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const [isEnteringPartial, setIsEnteringPartial] = useState(false);
  const [partialAmount, setPartialAmount] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [menuView, setMenuView] = useState('main');

  const handleDownloadPDF = () => {
    setIsDownloadingPdf(true);
    const link = document.createElement('a');
    link.href = `/api/downloadInvoice/${invoice.id}`;
    link.target = '_blank'; // Try to open in new tab
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsDownloadingPdf(false), 1500);
  };

  const handleDownloadImage = () => {
    setIsDownloadingImage(true);
    const link = document.createElement('a');
    link.href = `/api/downloadInvoice/${invoice.id}?format=image`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsDownloadingImage(false), 1500);
  };

  const handleShare = async (format) => {
    setIsSharing(true);
    const isImage = format === 'image';
    const url = isImage
      ? `/api/downloadInvoice/${invoice.id}?format=image`
      : `/api/downloadInvoice/${invoice.id}`;
    const fullUrl = `${window.location.origin}${url}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${invoice.invoiceNumber}`,
          text: `Here is the ${isImage ? 'image' : 'PDF'} for invoice ${invoice.invoiceNumber}`,
          url: fullUrl,
        });
      } catch (error) {
        console.error('Error sharing: Cancelled by the user', error);
      }
    } else {
      // FALLBACK TO DOWNLOAD IF NATIVE SHARE NOT AVAILABLE
      isImage ? handleDownloadImage() : handleDownloadPDF();
    }
    setIsSharing(false);
  };

  const handleSendInvoice = (method) => {
    const clientEmail = invoice.client?.email || '';
    const clientPhone = invoice.client?.phone || '';
    const invNumber = invoice.invoiceNumber;
    const amount = formatCurrency(invoice.total, currency);
    const dueDate = new Date(invoice.dueDate).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
    const pdfUrl = `${window.location.origin}/share/${invoice.id}`;

    if (method === 'whatsapp') {
      const cleanPhone = clientPhone.replace(/[\s\-()]/g, '');
      const message = encodeURIComponent(
        `Hi,\n\nPlease find your invoice *${invNumber}* for *${amount}*.\n\n📅 Due Date: ${dueDate}\n📄 Download: ${pdfUrl}\n\nThank you!`
      );
      const whatsappUrl = cleanPhone
        ? `https://wa.me/${cleanPhone}?text=${message}`
        : `https://wa.me/?text=${message}`;
      window.open(whatsappUrl, '_blank');
    } else if (method === 'email') {
      const subject = encodeURIComponent(`Invoice ${invNumber} — ${amount}`);
      const body = encodeURIComponent(
        `Hi,\n\nPlease find your invoice ${invNumber} for ${amount}.\n\nDue Date: ${dueDate}\nDownload PDF: ${pdfUrl}\n\nThank you!`
      );
      window.open(`mailto:${clientEmail}?subject=${subject}&body=${body}`, '_self');
    }
  };

  const handlePaymentAction = async (type) => {
    let amountToPay;
    if (type === 'full') {
      amountToPay = parseFloat(invoice.balanceDue);
    } else if (type === 'partial') {
      amountToPay = parseFloat(partialAmount);
      if (
        isNaN(amountToPay) ||
        amountToPay <= 0 ||
        amountToPay >= parseFloat(invoice.balanceDue)
      ) {
        toast('Please enter a valid amount greater than 0 and less than the balance due.');
        return;
      }
    } else {
      return;
    }

    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentAmount: amountToPay }),
      });
      const updatedInvoiceData = await res.json();
      if (!res.ok) throw new Error(updatedInvoiceData.message || 'Failed to process payment.');

      if (onUpdateInvoiceState) {
        onUpdateInvoiceState(updatedInvoiceData);
      }
      setPartialAmount('');
      setMenuView('main');
      setIsEnteringPartial(false);
    } catch (error) {
      console.error(error);
      toast(error.message);
    }
  };

  const pendingPayments = invoice._count?.payments || 0;
  const dropdownContentClass = 'ds-dropdown-content origin-top-right data-[side=top]:animate-slide-down data-[side=bottom]:animate-slide-up w-48';

  return (
    <>
      {isSharing && createPortal(<LoaderOverlay />, document.body)}

      <DropdownMenu.Root
        onOpenChange={(open) => {
          if (!open) {
            setIsEnteringPartial(false);
            setMenuView('main');
          }
        }}
      >
        <DropdownMenu.Trigger asChild>
          {triggerButton || (
            <button type="button" className="ds-icon-btn" aria-label="More actions">
              <MoreVertical className="w-4 h-4" />
            </button>
          )}
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className={dropdownContentClass}
            sideOffset={5}
            align={align}
            collisionPadding={10}
          >
            {isEnteringPartial ? (
              <div onSelect={(e) => e.preventDefault()} className="p-2 space-y-2">
                <label className="ds-form-label text-xs">Enter Amount</label>
                <div className="flex items-center ds-surface-muted rounded-md ds-shadow-ring">
                  <span className="text-sm px-2" style={{ color: 'var(--ds-gray-500)' }}>
                    {CURRENCY_SYMBOLS[currency] || '$'}
                  </span>
                  <input
                    type="number"
                    value={partialAmount}
                    onChange={(e) => setPartialAmount(e.target.value)}
                    placeholder={`Balance: ${invoice.balanceDue}`}
                    className="ds-input flex-1 border-0 shadow-none rounded-none py-2 text-sm"
                    autoFocus
                  />
                </div>
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => setIsEnteringPartial(false)}
                    className="ds-icon-btn"
                    aria-label="Cancel partial payment"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePaymentAction('partial')}
                    className="ds-icon-btn"
                    aria-label="Confirm partial payment"
                  >
                    <CheckCircle className="w-5 h-5" style={{ color: '#059669' }} />
                  </button>
                </div>
              </div>
            ) : menuView === 'main' ? (
              <>
                <DropdownMenu.Group>
                  <DropdownMenu.Item
                    onSelect={() => onEditInvoice(invoice.id)}
                    className="ds-dropdown-item"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Invoice
                  </DropdownMenu.Item>
                </DropdownMenu.Group>

                {invoice.status !== 'PAID' && (
                  <DropdownMenu.Group>
                    <DropdownMenu.Item
                      onSelect={() => handlePaymentAction('full')}
                      className="ds-dropdown-item"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Fully Paid
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={(e) => {
                        e.preventDefault();
                        setIsEnteringPartial(true);
                      }}
                      className="ds-dropdown-item"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Record Partial Payment
                    </DropdownMenu.Item>
                  </DropdownMenu.Group>
                )}

                <DropdownMenu.Group>
                  <DropdownMenu.Item
                    onSelect={() => handleDownloadPDF()}
                    className="ds-dropdown-item"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onSelect={() => handleDownloadImage()}
                    className="ds-dropdown-item"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Download Image
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onSelect={() => handleSendInvoice('email')}
                    className="ds-dropdown-item"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send via Email
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onSelect={() => handleSendInvoice('whatsapp')}
                    className="ds-dropdown-item"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send via WhatsApp
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onSelect={(e) => {
                      e.preventDefault();
                      setMenuView('share');
                    }}
                    className="ds-dropdown-item"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share Options...
                  </DropdownMenu.Item>
                </DropdownMenu.Group>
                <DropdownMenu.Separator
                  className="h-px my-1"
                  style={{ background: 'var(--ds-gray-100)' }}
                />
                <DropdownMenu.Group>
                  <DropdownMenu.Item
                    onSelect={() => window.location.href = '/payments'}
                    className="ds-dropdown-item"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    <span className="flex-1">Payment Logs</span>
                    {pendingPayments > 0 && (
                      <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white min-w-[18px] text-center">
                        {pendingPayments}
                      </span>
                    )}
                  </DropdownMenu.Item>
                </DropdownMenu.Group>
                <DropdownMenu.Separator
                  className="h-px my-1"
                  style={{ background: 'var(--ds-gray-100)' }}
                />
                <DropdownMenu.Group>
                  <DropdownMenu.Item
                    onSelect={() => onDeleteInvoice(invoice.id)}
                    className="ds-dropdown-item ds-dropdown-item-danger"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenu.Item>
                </DropdownMenu.Group>
              </>
            ) : (
              <DropdownMenu.Group>
                <DropdownMenu.Item
                  onSelect={(e) => {
                    e.preventDefault();
                    setMenuView('main');
                  }}
                  className="ds-dropdown-item"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => handleShare('image')}
                  className="ds-dropdown-item"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Image
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => handleShare('pdf')}
                  className="ds-dropdown-item"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </DropdownMenu.Item>
              </DropdownMenu.Group>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </>
  );
};

export default InvoiceActionMenu;
