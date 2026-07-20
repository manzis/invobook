import React, { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { createPortal } from 'react-dom';
import {
  DollarSign,
  Calendar,
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

import { getStatusIcon, getStatusBadgeClass, formatCurrency, CURRENCY_SYMBOLS } from '../../utils/InvoicesUtils';
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

const InvoiceTableRow = ({
  invoice,
  isSelected,
  onSelectInvoice,
  onDeleteInvoice,
  onEditInvoice,
  onViewInvoice,
  onUpdateInvoiceState,
  currency = 'USD',
  isQuotation = false,
  isPurchase = false,
  onConvert
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
    window.open(`/api/downloadInvoice/${invoice.id}`);
    setTimeout(() => setIsDownloadingPdf(false), 1500);
  };

  const handleDownloadImage = () => {
    setIsDownloadingImage(true);
    window.open(`/api/downloadInvoice/${invoice.id}?format=image`);
    setTimeout(() => setIsDownloadingImage(false), 1500);
  };

  const handleShare = async (format) => {
    setIsSharing(true);
    const isImage = format === 'image';
    const url = isImage
      ? `/api/downloadInvoice/${invoice.id}?format=image`
      : `/api/downloadInvoice/${invoice.id}`;
    const fileName = isImage
      ? `invoice-${invoice.invoiceNumber}.png`
      : `invoice-${invoice.invoiceNumber}.pdf`;
    const fileType = isImage ? 'image/png' : 'application/pdf';

    if (navigator.share) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Network response was not ok, status: ${response.status}`);
        }
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: fileType });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Invoice ${invoice.invoiceNumber}`,
            text: `Here is the invoice: ${invoice.invoiceNumber}`,
          });
        } else {
          toast('Sharing this file type is not supported on your device.');
        }
      } catch (error) {
        console.error('Error sharing: Cancelled by the user', error);
      }
    } else {
      toast('Web Share is not supported by your browser. Please use the download option instead.');
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
      // Clean phone number — remove spaces, dashes, keep + prefix
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

      onUpdateInvoiceState(updatedInvoiceData);
      setPartialAmount('');
    } catch (error) {
      console.error(error);
      toast(error.message);
    }
  };

  const clientName = invoice.client?.name || 'N/A';
  const itemCount = invoice.items?.length || 0;
  const pendingPayments = invoice._count?.payments || 0;
  const formattedDate = new Date(invoice.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedTotal = formatCurrency(invoice.total, currency);
  const status = invoice.status.toLowerCase().replace('_', ' ');
  const formattedDue = formatCurrency(invoice.balanceDue, currency);

  const dropdownContentClass =
    'ds-dropdown-content origin-top-right data-[side=top]:animate-slide-down data-[side=bottom]:animate-slide-up';

  return (
    <>
      {isSharing && createPortal(<LoaderOverlay />, document.body)}

      <tr 
        onClick={() => onViewInvoice && onViewInvoice(invoice.id)}
        className="cursor-pointer hover:bg-[var(--ds-gray-50)] transition-colors"
      >
        <td className="whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelectInvoice(invoice.id)}
            className="rounded"
            style={{ accentColor: 'var(--ds-black)' }}
          />
        </td>
        <td className="whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center ds-surface-muted">
              <DollarSign className="w-4 h-4" style={{ color: 'var(--ds-black)' }} />
            </div>
            <div>
              <p className="text-sm font-medium m-0" style={{ color: 'var(--ds-black)' }}>
                {isQuotation ? 'QUOT-' : isPurchase ? 'PURC-' : ''}{invoice.invoiceNumber}
              </p>
              <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--ds-gray-500)' }}>
                {itemCount} items
              </p>
            </div>
          </div>
        </td>
        <td className="whitespace-nowrap">
          <p className="text-sm m-0" style={{ color: 'var(--ds-black)' }}>
            {clientName}
          </p>
        </td>
        <td className="whitespace-nowrap">
          <p className="text-sm font-medium m-0" style={{ color: 'var(--ds-black)' }}>
            {formattedTotal}
          </p>
        </td>
        <td className="whitespace-nowrap">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--ds-gray-600)' }}>
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
        </td>
        <td className="whitespace-nowrap">
          <p className="text-sm m-0" style={{ color: 'var(--ds-gray-600)' }}>
            {formattedDue}
          </p>
        </td>
        <td className="whitespace-nowrap">
          <div className="flex items-center gap-2 flex-wrap">
            {getStatusIcon(status)}
            <span className={getStatusBadgeClass(status)}>{status}</span>
            {pendingPayments > 0 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold tracking-tight bg-amber-50 text-amber-700 border border-amber-200">
                <CreditCard className="w-3 h-3" />
                Payment Attempted
              </span>
            )}
          </div>
        </td>

        <td className="whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => onEditInvoice(invoice.id)}
              className="ds-icon-btn"
              aria-label="Edit invoice"
            >
              <Edit className="w-4 h-4" />
            </button>

            <DropdownMenu.Root modal={false}>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  disabled={isDownloadingPdf || isDownloadingImage}
                  className="ds-icon-btn disabled:opacity-50"
                  aria-label="Download invoice"
                >
                  {isDownloadingPdf || isDownloadingImage ? (
                    <div
                      className="animate-spin rounded-full h-4 w-4 border-b-2"
                      style={{ borderColor: 'var(--ds-black)' }}
                    />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className={`${dropdownContentClass} w-48`}
                  sideOffset={5}
                  collisionPadding={30}
                >
                  <DropdownMenu.Item onSelect={handleDownloadPDF} className="ds-dropdown-item">
                    <FileText className="w-4 h-4 mr-2" />
                    Download PDF
                  </DropdownMenu.Item>
                  <DropdownMenu.Item onSelect={handleDownloadImage} className="ds-dropdown-item">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Download Image
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            <DropdownMenu.Root
              modal={false}
              onOpenChange={(open) => {
                if (!open) {
                  setIsEnteringPartial(false);
                  setMenuView('main');
                }
              }}
            >
              <DropdownMenu.Trigger asChild>
                <button type="button" className="ds-icon-btn" aria-label="More actions">
                  <MoreVertical className="w-4 h-4" aria-hidden="true" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className={dropdownContentClass}
                  sideOffset={5}
                  collisionPadding={30}
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
                      {isQuotation && (
                        <DropdownMenu.Group>
                          <DropdownMenu.Item
                            onSelect={() => onConvert(invoice.id)}
                            className="ds-dropdown-item text-blue-600"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Convert to Sales Invoice
                          </DropdownMenu.Item>
                        </DropdownMenu.Group>
                      )}

                      {!isQuotation && invoice.status !== 'PAID' && (
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
                          Share
                        </DropdownMenu.Item>
                      </DropdownMenu.Group>
                      {!isQuotation && (
                        <>
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
                        </>
                      )}
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
          </div>
        </td>
      </tr>
    </>
  );
};

export default InvoiceTableRow;
