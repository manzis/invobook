// /components/Invoices/InvoiceTableRow.jsx (Corrected and Final)

import React, { useState } from 'react';

import { DollarSign, Calendar, Eye, Edit, Download, Trash2, CheckCircle } from 'lucide-react';
import { getStatusIcon, getStatusColor } from '../../utils/InvoicesUtils'; // Assuming you have this util

const InvoiceTableRow = ({ invoice, isSelected, onSelectInvoice, onMarkAsPaid, onDeleteInvoice, onDownloadPDF,onEditInvoice }) => {
  // --- This is the key change to adapt to the real data structure ---
  // The API now returns a `client` object with a `name`, and an `items` array.
  // We use optional chaining (`?.`) as a safety measure.

   const [isDownloading, setIsDownloading] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(invoice);

  const handleDownloadPDF = async (invoiceId) => {
    // Step 1: If a URL already exists, just open it. No need to regenerate.
    if (currentInvoice.pdfUrl) {
      window.open(currentInvoice.pdfUrl, '_blank');
      return;
    }

    // Step 2: If no URL, call the API to generate it
    setIsDownloading(true);
    try {
     const res = await fetch(`/api/downloadInvoice/${invoiceId}`, {
  method: 'POST',
});
      if (!res.ok) {
        throw new Error('Could not generate PDF.');
      }
      const data = await res.json();
      
      // Update local state with the new URL for the next click
      setCurrentInvoice(prev => ({ ...prev, pdfUrl: data.pdfUrl }));

      // Open the newly generated PDF in a new tab
      window.open(data.pdfUrl, '_blank');

    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const clientName = invoice.client?.name || 'N/A'; 
  const itemCount = invoice.items?.length || 0;
  
  // Format dates for better, consistent display (e.g., "Jul 30, 2025")
  const formattedDate = new Date(invoice.date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
  const formattedDueDate = new Date(invoice.dueDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
  
  // Format the currency value. Prisma returns Decimal as a string, so we parse it.
  const formattedTotal = parseFloat(invoice.total).toLocaleString('en-US', {
    style: 'currency',
    currency: 'NPR', // You could pass your currency code (e.g., 'NPR') here later
  });

  // The status from Prisma is in ALL_CAPS (e.g., "PENDING"), so we convert to lowercase for the util functions.
  const status = invoice.status.toLowerCase();

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelectInvoice(invoice.id)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            {/* Display the real invoice number */}
            <p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p>
            {/* Display the real item count */}
            <p className="text-xs text-gray-500">{itemCount} items</p>
          </div>
        </div>
      </td>
      {/* Display the real client name */}
      <td className="px-6 py-4 whitespace-nowrap">
        <p className="text-sm text-gray-900">{clientName}</p>
      </td>
      {/* Display the real, formatted total amount */}
      <td className="px-6 py-4 whitespace-nowrap">
        <p className="text-sm font-medium text-gray-900">{formattedTotal}</p>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          {/* Display the formatted date */}
          <span>{formattedDate}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <p className="text-sm text-gray-500">{formattedDueDate}</p>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          {getStatusIcon(status)}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
            {/* Capitalize the first letter of the lowercase status */}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center space-x-1">
          <button className="p-1.5 text-gray-400 hover:text-blue-600"><Eye className="w-4 h-4" /></button>
          <button onClick={() => onEditInvoice(invoice.id)}  className="p-1.5 text-gray-400 hover:text-emerald-600"><Edit className="w-4 h-4" /></button>
          <button 
            onClick={() => handleDownloadPDF(invoice.id)} 
            disabled={isDownloading}
            className="p-1.5 text-gray-400 hover:text-indigo-600 disabled:opacity-50"
          >
            {isDownloading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            ) : (
                <Download className="w-4 h-4" />
            )}
          </button>
          {status !== 'paid' && (
            <button onClick={() => onMarkAsPaid(invoice.id)} className="p-1.5 text-gray-400 hover:text-emerald-600"><CheckCircle className="w-4 h-4" /></button>
          )}
          <button onClick={() => onDeleteInvoice(invoice.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
        </div>
      </td>
    </tr>
  );
};

export default InvoiceTableRow;