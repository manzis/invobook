import React, { useState, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react'; // Only need Menu and Transition
import {
  DollarSign,
  Calendar,
  Edit,
  Download,
  Trash2,
  CheckCircle,
  MoreVertical,
  Mail,
  MessageSquare,
  XCircle,
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
  // --- STATE FOR UI INTERACTIVITY ---
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEnteringPartial, setIsEnteringPartial] = useState(false); // Controls the view inside the menu
  const [partialAmount, setPartialAmount] = useState('');

  // --- ACTION HANDLERS (No changes to logic, just passing the menu's close function) ---

  const handleSendInvoice = (method, closeMenu) => {
    alert(`Sending invoice to client via ${method}.`);
    if (closeMenu) closeMenu();
  };

  const handleDownloadPDF = async () => {
    if (invoice.pdfUrl) {
      window.open(invoice.pdfUrl, '_blank');
      return;
    }
    setIsDownloading(true);
    try {
      const res = await fetch(`/api/downloadInvoice/${invoice.id}`, { method: 'POST' });
      if (!res.ok) throw new Error('Could not generate PDF.');
      const data = await res.json();
      onUpdateInvoiceState({ ...invoice, pdfUrl: data.pdfUrl });
      window.open(data.pdfUrl, '_blank');
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Handles payment actions and closes the main menu on success.
   * @param {'full' | 'partial'} type - The type of payment.
   * @param {Function} [closeMenu] - The function to close the main 3-dot menu.
   */
 const handlePaymentAction = async (type, closePopover) => {
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
      if (closePopover) closePopover();
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

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* All table cells are unchanged */}
      <td className="px-6 py-4 whitespace-nowrap"><input type="checkbox" checked={isSelected} onChange={() => onSelectInvoice(invoice.id)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/></td>
      <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center space-x-3"><div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><DollarSign className="w-4 h-4 text-blue-600"/></div><div><p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p><p className="text-xs text-gray-500">{itemCount} items</p></div></div></td>
      <td className="px-6 py-4 whitespace-nowrap"><p className="text-sm text-gray-900">{clientName}</p></td>
      <td className="px-6 py-4 whitespace-nowrap"><p className="text-sm font-medium text-gray-900">{formattedTotal}</p></td>
      <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center space-x-2 text-sm text-gray-500"><Calendar className="w-4 h-4"/><span>{formattedDate}</span></div></td>
      <td className="px-6 py-4 whitespace-nowrap"><p className="text-sm text-gray-500">{formattedDueDate}</p></td>
      <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center space-x-2">{getStatusIcon(status)}<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${getStatusColor(status)}`}>{status}</span></div></td>
      
      {/* --- ACTION BUTTONS COLUMN --- */}
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end space-x-1">
          <button onClick={() => onEditInvoice(invoice.id)} className="p-1.5 text-gray-400 hover:text-emerald-600"><Edit className="w-4 h-4"/></button>
          <button onClick={handleDownloadPDF} disabled={isDownloading} className="p-1.5 text-gray-400 hover:text-indigo-600 disabled:opacity-50">{isDownloading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div> : <Download className="w-4 h-4"/>}</button>

          {/* SIMPLIFIED 3-DOT MENU */}
          <Menu as="div" className="relative inline-block text-left">
            {({ close }) => (
              <>
                <Menu.Button className="inline-flex justify-center w-full rounded-md p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none">
                  <MoreVertical className="w-4 h-4" aria-hidden="true"/>
                </Menu.Button>
                <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                  <Menu.Items
                    // When the menu panel loses focus, reset the input view
                    onBlur={() => setIsEnteringPartial(false)}
                    className="absolute right-0 z-[1000] mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg border border-gray-200 focus:outline-none divide-y divide-gray-100"
                  >
                    {isEnteringPartial ? (
                      // --- VIEW 2: PARTIAL PAYMENT INPUT ---
                      <div className="p-3 space-y-2">
                        <label className="text-xs font-medium text-gray-700 block">Enter Amount</label>
                        <div className="flex items-center bg-gray-50 rounded-md">
                          <span className="text-gray-500 text-sm px-2">{invoice.currencySymbol || '$'}</span>
                          <input
                            type="number"
                            value={partialAmount}
                            onChange={(e) => setPartialAmount(e.target.value)}
                            placeholder={`Balance: ${invoice.balanceDue}`}
                            className="w-full pl-1 pr-2 py-1 border-l border-gray-300 bg-transparent text-sm focus:ring-0 focus:outline-none"
                            autoFocus
                            // Stop clicks inside the input from closing the menu
                            onClick={(e) => e.stopPropagation()} 
                          />
                        </div>
                        <div className="flex items-center justify-end space-x-1">
                          <button onClick={() => setIsEnteringPartial(false)} className="p-2 text-gray-400 hover:text-red-600"><XCircle className="w-5 h-5"/></button>
                          <button onClick={() => handlePaymentAction('partial', close)} className="p-2 text-emerald-500 hover:text-emerald-700"><CheckCircle className="w-5 h-5"/></button>
                        </div>
                      </div>
                    ) : (
                      // --- VIEW 1: STANDARD MENU ---
                      <>
                        {invoice.status !== 'PAID' && (
                          <div className="px-1 py-1">
                            <Menu.Item>
                              {({ active }) => (<button onClick={() => handlePaymentAction('full', close)} className={`${active ? 'bg-emerald-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><CheckCircle className="w-4 h-4 mr-2"/> Mark as Fully Paid</button>)}
                            </Menu.Item>
                            
                            {/* THE CRITICAL FIX IS HERE */}
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={(e) => {
                                    // Prevent the menu from closing and stop the event
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsEnteringPartial(true);
                                  }}
                                  className={`${active ? 'bg-yellow-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2"/> Record Partial Payment
                                </button>
                              )}
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