// /components/Invoices/InvoiceTable.jsx (Corrected and Final)

import React from 'react';
import { useRouter } from 'next/router';
import InvoiceTableRow from './Invoices/InvoiceTableRow';
import EmptyState from './Invoices/EmptyState';

const InvoiceTable = ({ invoices, selectedInvoices, onSelectAll, ...props }) => {
  const router = useRouter();

  // --- FIX #1: The Empty State check is now the first thing the component does. ---
  // If the `invoices` array passed via props is empty, we return the EmptyState immediately.
  // The EmptyState component is now correctly wrapped in the same styled container
  // as the table, so it looks visually consistent.
  if (invoices.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <EmptyState onNewInvoiceClick={() => router.push('/new-invoice')} />
      </div>
    );
  }

  // --- FIX #2: If there are invoices, we proceed to render the table. ---
  // The `isLoading` check has been removed because this component should not be aware of it.
  // The parent page (`invoices.jsx`) is responsible for the loading state.
  const isAllSelected = selectedInvoices.length === invoices.length && invoices.length > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <InvoiceTableRow
                key={invoice.id}
                invoice={invoice}
                isSelected={selectedInvoices.includes(invoice.id)}
                {...props}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceTable;