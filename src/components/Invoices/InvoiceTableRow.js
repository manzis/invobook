import React, { useState, Fragment } from 'react';
// The Menu components are imported but intentionally NOT used in the JSX below.
import { Menu, Transition } from '@headlessui/react';
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
  // --- STATE FOR UI INTERACTIVITY (Unchanged) ---
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  // The state for partial payments is no longer needed in this diagnostic version.

  // --- ALL HANDLERS ARE CORRECT AND UNCHANGED ---
  // The logic inside these functions is stable.
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
    // This function handles the "Mark as Fully Paid" action.
    let amountToPay;
    if (type === 'full') {
      amountToPay = parseFloat(invoice.balanceDue);
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
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // --- DATA FORMATTING (Unchanged) ---
  const clientName = invoice.client?.name || 'N/A';
  const itemCount = invoice.items?.length || 0;
  const formattedDate = new Date(invoice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const formattedDueDate = new Date(invoice.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const formattedTotal = parseFloat(invoice.total).toLocaleString('en-US', { style: 'currency', currency: 'NPR' });
  const status = invoice.status.toLowerCase().replace('_', ' ');
  const formattedDue = parseFloat(invoice.balanceDue).toLocaleString('en-US', { style: 'currency', currency: 'NPR' });

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap"><input type="checkbox" checked={isSelected} onChange={() => onSelectInvoice(invoice.id)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/></td>
      <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center space-x-3"><div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><DollarSign className="w-4 h-4 text-blue-600"/></div><div><p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p><p className="text-xs text-gray-500">{itemCount} items</p></div></div></td>
      <td className="px-6 py-4 whitespace-nowrap"><p className="text-sm text-gray-900">{clientName}</p></td>
      <td className="px-6 py-4 whitespace-nowrap"><p className="text-sm font-medium text-gray-900">{formattedTotal}</p></td>
      <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center space-x-2 text-sm text-gray-500"><Calendar className="w-4 h-4"/><span>{formattedDate}</span></div></td>
      <td className="px-6 py-4 whitespace-nowrap"><p className="text-sm text-gray-500">{formattedDue}</p></td>
      <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center space-x-2">{getStatusIcon(status)}<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${getStatusColor(status)}`}>{status}</span></div></td>
      
      {/* --- DIAGNOSTIC TEST: All <Menu> components are replaced with simple <button>s --- */}
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end space-x-2">
          
          <button onClick={() => onEditInvoice(invoice.id)} className="p-1.5 text-gray-400 hover:text-emerald-600 transition-colors">
            <Edit className="w-4 h-4"/>
          </button>
          
          <button onClick={handleDownloadPDF} disabled={isDownloadingPdf || isDownloadingImage} className="p-1.5 text-gray-400 hover:text-indigo-600 disabled:opacity-50 transition-colors">
            {isDownloadingPdf ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div> : <FileText className="w-4 h-4"/>}
          </button>

          <button onClick={handleDownloadImage} disabled={isDownloadingPdf || isDownloadingImage} className="p-1.5 text-gray-400 hover:text-indigo-600 disabled:opacity-50 transition-colors">
            {isDownloadingImage ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div> : <ImageIcon className="w-4 h-4"/>}
          </button>

          {invoice.status !== 'PAID' && (
            <button onClick={() => handlePaymentAction('full')} className="p-1.5 text-gray-400 hover:text-green-600 transition-colors">
              <CheckCircle className="w-4 h-4"/>
            </button>
          )}

          <button onClick={() => handleSendInvoice('email')} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
            <Mail className="w-4 h-4"/>
          </button>
          
          <button onClick={() => onDeleteInvoice(invoice.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
            <Trash2 className="w-4 h-4"/>
          </button>

        </div>
      </td>
    </tr>
  );
};

export default InvoiceTableRow;