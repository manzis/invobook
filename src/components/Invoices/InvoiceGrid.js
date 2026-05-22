import React from 'react';
import { format } from 'date-fns';
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
        const amount = Number(invoice.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const dateStr = invoice.date ? format(new Date(invoice.date), 'MMM dd, yyyy') : 'No Date';

        // Status Badge Logic
        let statusClass = 'bg-gray-100 text-gray-700 border-gray-200';
        if (invoice.status === 'PAID') statusClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (invoice.status === 'PENDING') statusClass = 'bg-orange-50 text-orange-700 border-orange-200';
        if (invoice.status === 'OVERDUE') statusClass = 'bg-red-50 text-red-700 border-red-200';
        if (invoice.status === 'PARTIALLY_PAID') statusClass = 'bg-blue-50 text-blue-700 border-blue-200';

        return (
          <div key={invoice.id} className="ds-card-static p-5 flex flex-col group relative">

            <div className="flex justify-between items-start mb-4">
              <span className={`px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-md border ${statusClass}`}>
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

            <div className="mb-4">
              <h4 className="font-semibold text-[var(--ds-black)] text-base">{invoice.invoiceNumber}</h4>
              <p className="text-sm text-[var(--ds-gray-500)] mt-0.5">{clientName}</p>
            </div>

            <div className="flex justify-between items-end mt-auto pt-4 border-t border-[var(--ds-gray-100)]">
              <div>
                <p className="text-[11px] text-[var(--ds-gray-500)] font-medium uppercase tracking-widest mb-1">Total</p>
                <p className="text-xl font-semibold text-[var(--ds-black)] tracking-tight">
                  {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency} {amount}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-[var(--ds-gray-500)] font-medium uppercase tracking-widest mb-1">Date</p>
                <p className="text-sm font-medium text-[var(--ds-gray-800)]">{dateStr}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InvoiceGrid;
