import React from 'react';
import InvoiceTableRow from './InvoiceTableRow';

const InvoiceTable = ({ invoices, selectedInvoices, onSelectAll, ...props }) => {
  const isAllSelected = selectedInvoices.length === invoices.length && invoices.length > 0;

  return (
    <div className="ds-table-wrap">
      <div className="overflow-x-auto">
        <table className="ds-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onSelectAll}
                  className="rounded"
                  style={{ accentColor: 'var(--ds-black)' }}
                />
              </th>
              <th>Invoice</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Balance Due</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
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
