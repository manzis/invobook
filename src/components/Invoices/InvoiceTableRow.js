import React, { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  DollarSign, Calendar, Edit, Download, Trash2, CheckCircle, MoreVertical,
  Mail, FileText, Image as ImageIcon, MessageSquare, XCircle,
} from 'lucide-react';

import { getStatusIcon, getStatusColor } from '../../utils/InvoicesUtils';

const InvoiceTableRow = ({
  invoice,
  isSelected,
  onSelectInvoice,
  onDeleteInvoice,
  onEditInvoice,
  onUpdateInvoiceState,
}) => {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const [isEnteringPartial, setIsEnteringPartial] = useState(false);
  const [partialAmount, setPartialAmount] = useState('');

  // --- STABLE HANDLERS ---
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

  const handleSendInvoice = (method) => {
    alert(`Sending invoice to client via ${method}.`);
  };
  
  const handlePaymentAction = async (type) => {
    let amountToPay;
    if (type === 'full') {
      amountToPay = parseFloat(invoice.balanceDue);
    } else if (type === 'partial') {
      amountToPay = parseFloat(partialAmount);
      if (isNaN(amountToPay) || amountToPay <= 0 || amountToPay >= parseFloat(invoice.balanceDue)) {
        alert('Please enter a valid amount greater than 0 and less than the balance due.');
        return;
      }
    } else { return; }

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
      alert(error.message);
    }
  };

  // --- DATA FORMATTING ---
  const clientName = invoice.client?.name || 'N/A';
  const itemCount = invoice.items?.length || 0;
  const formattedDate = new Date(invoice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const formattedDueDate = new Date(invoice.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const formattedTotal = parseFloat(invoice.total).toLocaleString('en-US', { style: 'currency', currency: 'NPR' });
  const status = invoice.status.toLowerCase().replace('_', ' ');
  const formattedDue = parseFloat(invoice.balanceDue).toLocaleString('en-US', { style: 'currency', currency: 'NPR' });

  // --- STYLES ---
  const contentClasses = "z-50 min-w-[220px] origin-top-right bg-white rounded-md shadow-lg border border-gray-200 focus:outline-none p-1 data-[side=top]:animate-slide-down data-[side=bottom]:animate-slide-up";
  const itemClasses = "group flex rounded-md items-center w-full px-2 py-2 text-sm text-gray-900 focus:outline-none select-none";
  const itemColorClasses = {
    indigo: "focus:bg-indigo-500 focus:text-white",
    emerald: "focus:bg-emerald-500 focus:text-white",
    yellow: "focus:bg-yellow-500 focus:text-white",
    blue: "focus:bg-blue-500 focus:text-white",
    red: "focus:bg-red-500 focus:text-white",
  };
  const actionButtonClasses = "p-1.5 text-gray-400 rounded-md transition-colors";
  const actionButtonHoverClasses = {
    edit: "hover:bg-emerald-50 hover:text-emerald-600",
    download: "hover:bg-indigo-50 hover:text-indigo-600",
    more: "hover:bg-gray-100 hover:text-gray-600",
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap"><input type="checkbox" checked={isSelected} onChange={() => onSelectInvoice(invoice.id)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/></td>
      <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center space-x-3"><div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><DollarSign className="w-4 h-4 text-blue-600"/></div><div><p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p><p className="text-xs text-gray-500">{itemCount} items</p></div></div></td>
      <td className="px-6 py-4 whitespace-nowrap"><p className="text-sm text-gray-900">{clientName}</p></td>
      <td className="px-6 py-4 whitespace-nowrap"><p className="text-sm font-medium text-gray-900">{formattedTotal}</p></td>
      <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center space-x-2 text-sm text-gray-500"><Calendar className="w-4 h-4"/><span>{formattedDate}</span></div></td>
      <td className="px-6 py-4 whitespace-nowrap"><p className="text-sm text-gray-500">{formattedDue}</p></td>
      <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center space-x-2">{getStatusIcon(status)}<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${getStatusColor(status)}`}>{status}</span></div></td>
      
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end space-x-1">
          <button onClick={() => onEditInvoice(invoice.id)} className={`${actionButtonClasses} ${actionButtonHoverClasses.edit}`}>
            <Edit className="w-4 h-4"/>
          </button>
          
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button disabled={isDownloadingPdf || isDownloadingImage} className={`${actionButtonClasses} ${actionButtonHoverClasses.download} disabled:opacity-50`}>
                {(isDownloadingPdf || isDownloadingImage) ? (<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>) : (<Download className="w-4 h-4"/>)}
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className={`${contentClasses} w-48`} sideOffset={5} collisionPadding={30}>
                <DropdownMenu.Item onSelect={handleDownloadPDF} className={`${itemClasses} ${itemColorClasses.indigo}`}>
                  <FileText className="w-4 h-4 mr-2"/> Download PDF
                </DropdownMenu.Item>
                <DropdownMenu.Item onSelect={handleDownloadImage} className={`${itemClasses} ${itemColorClasses.indigo}`}>
                  <ImageIcon className="w-4 h-4 mr-2"/> Download Image
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <DropdownMenu.Root onOpenChange={(open) => !open && setIsEnteringPartial(false)}>
            <DropdownMenu.Trigger asChild>
              <button className={`${actionButtonClasses} ${actionButtonHoverClasses.more}`}>
                <MoreVertical className="w-4 h-4" aria-hidden="true"/>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className={contentClasses} sideOffset={5} collisionPadding={30} >
                {isEnteringPartial ? (
                  <div onSelect={(e) => e.preventDefault()} className="p-2 space-y-2">
                    <label className="text-xs font-medium text-gray-700 block">Enter Amount</label>
                    <div className="flex items-center bg-gray-50 rounded-md">
                      <span className="text-gray-500 text-sm px-2">{invoice.currencySymbol || '$'}</span>
                      <input type="number" value={partialAmount} onChange={(e) => setPartialAmount(e.target.value)} placeholder={`Balance: ${invoice.balanceDue}`} className="w-full pl-1 pr-2 py-1 border-l border-gray-300 bg-transparent text-sm focus:ring-0 focus:outline-none" autoFocus/>
                    </div>
                    <div className="flex items-center justify-end space-x-1">
                      <button onClick={() => setIsEnteringPartial(false)} className="p-2 text-gray-400 hover:text-red-600"><XCircle className="w-5 h-5"/></button>
                      <button onClick={() => handlePaymentAction('partial')} className="p-2 text-emerald-500 hover:text-emerald-700"><CheckCircle className="w-5 h-5"/></button>
                    </div>
                  </div>
                ) : (
                  <>
                    {invoice.status !== 'PAID' && (
                      <DropdownMenu.Group>
                        <DropdownMenu.Item onSelect={() => handlePaymentAction('full')} className={`${itemClasses} ${itemColorClasses.emerald}`}><CheckCircle className="w-4 h-4 mr-2"/> Mark as Fully Paid</DropdownMenu.Item>
                        <DropdownMenu.Item onSelect={(e) => { e.preventDefault(); setIsEnteringPartial(true); }} className={`${itemClasses} ${itemColorClasses.yellow}`}><CheckCircle className="w-4 h-4 mr-2"/> Record Partial Payment</DropdownMenu.Item>
                      </DropdownMenu.Group>
                    )}
                    
                    <DropdownMenu.Group>
                      <DropdownMenu.Item onSelect={() => handleSendInvoice('email')} className={`${itemClasses} ${itemColorClasses.blue}`}><Mail className="w-4 h-4 mr-2"/> Send via Email</DropdownMenu.Item>
                      <DropdownMenu.Item onSelect={() => handleSendInvoice('whatsapp')} className={`${itemClasses} ${itemColorClasses.blue}`}><MessageSquare className="w-4 h-4 mr-2"/> Send via WhatsApp</DropdownMenu.Item>
                    </DropdownMenu.Group>
                    <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />
                    <DropdownMenu.Group>
                      <DropdownMenu.Item onSelect={() => onDeleteInvoice(invoice.id)} className={`${itemClasses} ${itemColorClasses.red}`}><Trash2 className="w-4 h-4 mr-2"/> Delete</DropdownMenu.Item>
                    </DropdownMenu.Group>
                  </>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </td>
    </tr>
  );
};

export default InvoiceTableRow;