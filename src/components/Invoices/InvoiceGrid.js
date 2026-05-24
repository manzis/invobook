import React from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import InvoiceActionMenu from './InvoiceActionMenu';

const InvoiceGrid = ({
  invoices,
  currency,
  onEditInvoice,
  onDeleteInvoice,
  onMarkAsPaid,
  onDownloadPDF,
  onUpdateInvoiceState
}) => {
  if (!invoices || invoices.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {invoices.map((invoice) => {
        const clientName = invoice.client?.name || 'Unknown Client';

        let dateStr = 'No Date';
        if (invoice.date) {
          const d = new Date(invoice.date);
          if (isToday(d)) {
            dateStr = 'today';
          } else if (isYesterday(d)) {
            dateStr = 'yesterday';
          } else {
            dateStr = format(d, 'MMM dd, yyyy');
          }
        }

        const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency;
        const itemsCount = invoice.items?.length || 1;
        const clientDetail = invoice.client?.address || invoice.client?.email || '';

        // Total calculation
        const amount = Number(invoice.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // Balance due calculation
        const due = invoice.balanceDue !== undefined ? invoice.balanceDue : invoice.total;
        const dueAmount = Number(due || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // Status Badge Logic
        let statusClass = 'bg-[var(--ds-gray-100)] text-[var(--ds-gray-700)] border-[var(--ds-gray-200)]';
        if (invoice.status === 'PAID') statusClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';
        if (invoice.status === 'PENDING') statusClass = 'bg-orange-50 text-orange-700 border-orange-100';
        if (invoice.status === 'OVERDUE') statusClass = 'bg-red-50 text-red-700 border-red-100';
        if (invoice.status === 'PARTIALLY_PAID') statusClass = 'bg-blue-50 text-blue-700 border-blue-100';

        return (
          <div key={invoice.id} className="bg-white rounded-[12px] border border-[var(--ds-gray-100)] p-5 flex flex-col group relative">

            {/* Top Bar */}
            <div className="flex justify-between items-start mb-5">
              <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${statusClass}`}>
                {invoice.status || 'DRAFT'}
              </span>
              <InvoiceActionMenu
                invoice={invoice}
                currency={currency}
                onEditInvoice={onEditInvoice}
                onDeleteInvoice={onDeleteInvoice}
                onUpdateInvoiceState={onUpdateInvoiceState}
                align="end"
              />
            </div>

            {/* Invoice Number, Date & Total */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[12px] font-semibold text-[var(--ds-gray-500)] uppercase tracking-wider">
                  INVOICE #{invoice.invoiceNumber}
                </span>
                <span className="text-[12px] font-medium text-[var(--ds-gray-400)] capitalize">{dateStr}</span>
              </div>
              <div className="text-[18px] font-bold text-[var(--ds-black)] tracking-tight">
                {currencySymbol} {amount}
              </div>
            </div>

            {/* Bottom Info Section */}
            <div className="flex rounded-[8px] border border-[var(--ds-gray-100)] overflow-hidden mt-auto bg-white">
              <div className="p-2.5 sm:p-3 border-r border-[var(--ds-gray-100)] flex flex-col justify-center shrink-0">
                <p className="text-[10px] text-[var(--ds-gray-400)] font-semibold uppercase tracking-wider mb-1">Items</p>
                <p className="font-semibold text-[13px] text-[var(--ds-black)]">{itemsCount}</p>
              </div>
              <div className="p-2.5 sm:p-3 border-r border-[var(--ds-gray-100)] flex flex-col justify-center flex-1 min-w-0">
                <p className="text-[10px] text-[var(--ds-gray-400)] font-semibold uppercase tracking-wider mb-1">Customer</p>
                <p className="font-semibold text-[13px] text-[var(--ds-black)] truncate">{clientName}</p>
                {clientDetail && (
                  <p className="text-[11px] text-[var(--ds-gray-500)] truncate mt-0.5">{clientDetail}</p>
                )}
              </div>
              <div className="p-2.5 sm:p-3 bg-[var(--ds-gray-50)] flex flex-col justify-center shrink-0 min-w-[85px] sm:min-w-[95px]">
                <p className="text-[10px] text-[var(--ds-gray-400)] font-semibold uppercase tracking-wider mb-1 whitespace-nowrap">
                  Balance Due
                </p>
                <p className="font-semibold text-[13px] text-[var(--ds-black)] truncate">{currencySymbol} {dueAmount}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InvoiceGrid;
