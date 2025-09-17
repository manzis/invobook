import React, { useState, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
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

  // --- STABLE PDF DOWNLOAD HANDLER ---
  const handleDownloadPDF = (closeMenu) => {
    // 1. Close the menu immediately for a responsive feel.
    if (closeMenu) closeMenu();
    
    // 2. Then, handle your own logic and state updates.
    setIsDownloadingPdf(true);
    window.open(`/api/downloadInvoice/${invoice.id}`);
    setTimeout(() => {
      setIsDownloadingPdf(false);
    }, 1500);
  };

  // --- STABLE IMAGE DOWNLOAD HANDLER ---
  const handleDownloadImage = (closeMenu) => {
    // 1. Close the menu immediately.
    if (closeMenu) closeMenu();

    // 2. Then, handle your logic.
    setIsDownloadingImage(true);
    window.open(`/api/downloadInvoice/${invoice.id}?format=image`);
    setTimeout(() => {
      setIsDownloadingImage(false);
    }, 1500);
  };

  // --- STABLE "SEND" HANDLER ---
  const handleSendInvoice = (method, closeMenu) => {
    // 1. Close the menu immediately.
    if (closeMenu) closeMenu();

    // 2. Then, show the alert.
    alert(`Sending invoice to client via ${method}.`);
  };
  
  // --- STABLE PAYMENT HANDLER ---
  const handlePaymentAction = async (type, closePopover) => {
    // 1. Close the menu immediately.
    if (closePopover) closePopover();

    // 2. Then, handle all async logic and parent state updates.
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

  // --- Data Formatting (Unchanged) ---
  const clientName = invoice.client?.name || 'N/A';
  const itemCount = invoice.items?.length || 0;
  const formattedDate = new Date(invoice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const formattedDueDate = new Date(invoice.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const formattedTotal = parseFloat(invoice.total).toLocaleString('en-US', { style: 'currency', currency: 'NPR' });
  const status = invoice.status.toLowerCase().replace('_', ' ');
  const formattedDue = parseFloat(invoice.balanceDue).toLocaleString('en-US', { style: 'currency', currency: 'NPR' });

  return (
    <tr className="hover:bg-gray-50 transition-colors">
        {/* All JSX is the same as your working version, just the handlers above are changed */}
        <td className="px-6 py-4 whitespace-nowrap"><input type="checkbox" checked={isSelected} onChange={() => onSelectInvoice(invoice.id)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/></td>
        <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center space-x-3"><div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><DollarSign className="w-4 h-4 text-blue-600"/></div><div><p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p><p className="text-xs text-gray-500">{itemCount} items</p></div></div></td>
        <td className="px-6 py-4 whitespace-nowrap"><p className="text-sm text-gray-900">{clientName}</p></td>
        <td className="px-6 py-4 whitespace-nowrap"><p className="text-sm font-medium text-gray-900">{formattedTotal}</p></td>
        <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center space-x-2 text-sm text-gray-500"><Calendar className="w-4 h-4"/><span>{formattedDate}</span></div></td>
        <td className="px-6 py-4 whitespace-nowrap"><p className="text-sm text-gray-500">{formattedDue}</p></td>
        <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center space-x-2">{getStatusIcon(status)}<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${getStatusColor(status)}`}>{status}</span></div></td>
        <td className="px-6 py-4 whitespace-nowrap text-right">
            <div className="flex items-center justify-end space-x-1">
            <button onClick={() => onEditInvoice(invoice.id)} className="p-1.5 text-gray-400 hover:text-emerald-600"><Edit className="w-4 h-4"/></button>
            <Menu as="div" className="relative inline-block text-left">
                {({ close }) => (
                <>
                    <Menu.Button disabled={isDownloadingPdf || isDownloadingImage} className="p-1.5 text-gray-400 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed">
                    {(isDownloadingPdf || isDownloadingImage) ? (<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>) : (<Download className="w-4 h-4"/>)}
                    </Menu.Button>
                    <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right bg-white rounded-md shadow-lg border border-gray-200 focus:outline-none">
                        <div className="px-1 py-1">
                        <Menu.Item>{({ active }) => ( <button onClick={() => handleDownloadPDF(close)} className={`${active ? 'bg-indigo-500 text-white' : 'text-gray-900'} group flex items-center w-full px-2 py-2 text-sm rounded-md`}><FileText className="w-4 h-4 mr-2"/> Download PDF</button>)}</Menu.Item>
                        <Menu.Item>{({ active }) => ( <button onClick={() => handleDownloadImage(close)} className={`${active ? 'bg-indigo-500 text-white' : 'text-gray-900'} group flex items-center w-full px-2 py-2 text-sm rounded-md`}><ImageIcon className="w-4 h-4 mr-2"/> Download Image</button>)}</Menu.Item>
                        </div>
                    </Menu.Items>
                    </Transition>
                </>
                )}
            </Menu>
            <Menu as="div" className="relative inline-block text-left">
                {({ close }) => (
                <>
                    <Menu.Button className="inline-flex justify-center w-full rounded-md p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"><MoreVertical className="w-4 h-4" aria-hidden="true"/></Menu.Button>
                    <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                    <Menu.Items onBlur={() => setIsEnteringPartial(false)} className="absolute right-0 z-[1000] mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg border border-gray-200 focus:outline-none divide-y divide-gray-100">
                        {isEnteringPartial ? (
                        <div className="p-3 space-y-2">
                            <label className="text-xs font-medium text-gray-700 block">Enter Amount</label>
                            <div className="flex items-center bg-gray-50 rounded-md">
                            <span className="text-gray-500 text-sm px-2">{invoice.currencySymbol || '$'}</span>
                            <input type="number" value={partialAmount} onChange={(e) => setPartialAmount(e.target.value)} placeholder={`Balance: ${invoice.balanceDue}`} className="w-full pl-1 pr-2 py-1 border-l border-gray-300 bg-transparent text-sm focus:ring-0 focus:outline-none" autoFocus onClick={(e) => e.stopPropagation()}/>
                            </div>
                            <div className="flex items-center justify-end space-x-1">
                            <button onClick={() => setIsEnteringPartial(false)} className="p-2 text-gray-400 hover:text-red-600"><XCircle className="w-5 h-5"/></button>
                            <button onClick={() => handlePaymentAction('partial', close)} className="p-2 text-emerald-500 hover:text-emerald-700"><CheckCircle className="w-5 h-5"/></button>
                            </div>
                        </div>
                        ) : (
                        <>
                            {invoice.status !== 'PAID' && (
                            <div className="px-1 py-1">
                                <Menu.Item>
                                    <button onClick={() => handlePaymentAction('full', close)} className={`group flex rounded-md items-center w-full px-2 py-2 text-sm text-gray-900 hover:bg-emerald-500 hover:text-white`}><CheckCircle className="w-4 h-4 mr-2"/> Mark as Fully Paid</button>
                                </Menu.Item>
                                <Menu.Item>
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEnteringPartial(true); }} className={`group flex rounded-md items-center w-full px-2 py-2 text-sm text-gray-900 hover:bg-yellow-500 hover:text-white`}><CheckCircle className="w-4 h-4 mr-2"/> Record Partial Payment</button>
                                </Menu.Item>
                            </div>
                            )}
                            <div className="px-1 py-1">
                            <Menu.Item>{({ active }) => (<button onClick={() => handleSendInvoice('email', close)} className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><Mail className="w-4 h-4 mr-2"/> Send via Email</button>)}</Menu.Item>
                            <Menu.Item>{({ active }) => (<button onClick={() => handleSendInvoice('whatsapp', close)} className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><MessageSquare className="w-4 h-4 mr-2"/> Send via WhatsApp</button>)}</Menu.Item>
                            </div>
                            <div className="px-1 py-1">
                            <Menu.Item>{({ active }) => (<button onClick={() => onDeleteInvoice(invoice.id)} className={`${active ? 'bg-red-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><Trash2 className="w-4 h-4 mr-2"/> Delete</button>)}</Menu.Item>
                            </div>
                        </>
                        )}
                    </Menu.Items>
                    </Transition>
                </>
                )}
            </Menu>
            </div>
        </td>
    </tr>
  );
};

export default InvoiceTableRow;