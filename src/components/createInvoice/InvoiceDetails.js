import React from 'react';
import { Calendar } from 'lucide-react';

const InvoiceDetails = ({ invoiceNumber, date, dueDate, onFieldChange }) => {
  return (
    <div className="ds-card-static">
      <h3 className="ds-card-title text-[20px] mb-4">Invoice Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="ds-form-label">Invoice Number</label>
          <input
            type="text"
            value={invoiceNumber}
            onChange={(e) => onFieldChange('invoiceNumber', e.target.value)}
            className="ds-input"
          />
        </div>
        <div>
          <label className="ds-form-label">Invoice Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ds-gray-400)] pointer-events-none" />
            <input
              type="date"
              value={date}
              onChange={(e) => onFieldChange('date', e.target.value)}
              className="ds-input pl-10"
            />
          </div>
        </div>
        <div>
          <label className="ds-form-label">Due Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ds-gray-400)] pointer-events-none" />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => onFieldChange('dueDate', e.target.value)}
              className="ds-input pl-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
