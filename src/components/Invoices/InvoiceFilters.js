// /components/Invoices/InvoiceFilters.jsx (Updated Layout)

import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, Trash2, Filter, X } from 'lucide-react';

const InvoiceFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  selectedInvoicesCount,
  onBulkDelete,
  onBulkMarkPaid,
}) => {
  const [localStatusFilter, setLocalStatusFilter] = useState(statusFilter);
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);

  useEffect(() => {
    setLocalStatusFilter(statusFilter);
    setLocalStartDate(startDate);
    setLocalEndDate(endDate);
  }, [statusFilter, startDate, endDate]);

  const handleApplyFilters = () => {
    setStatusFilter(localStatusFilter);
    setStartDate(localStartDate);
    setEndDate(localEndDate);
  };

  const handleClearFilters = () => {
    setLocalStatusFilter('all');
    setLocalStartDate('');
    setLocalEndDate('');
    setSearchTerm('');
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = statusFilter !== 'all' || startDate || endDate;

  return (
    <div className="ds-card-static mb-6 space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative grow">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: 'var(--ds-gray-400)' }}
          />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ds-input pl-10 w-full sm:max-w-xs"
          />
        </div>

        <div className="flex flex-wrap items-center justify-start md:justify-end gap-3">
          <select
            value={localStatusFilter}
            onChange={(e) => setLocalStatusFilter(e.target.value)}
            className="ds-select"
          >
            <option value="all">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="DRAFT">Draft</option>
          </select>

          <div className="flex items-center gap-2">
            <label htmlFor="start-date" className="ds-form-label sr-only md:not-sr-only m-0">
              From:
            </label>
            <input
              id="start-date"
              type="date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              className="ds-input w-auto text-sm py-2"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="end-date" className="ds-form-label sr-only md:not-sr-only m-0">
              To:
            </label>
            <input
              id="end-date"
              type="date"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
              className="ds-input w-auto text-sm py-2"
            />
          </div>

          <button type="button" onClick={handleApplyFilters} className="ds-btn-dark gap-2">
            <Filter className="w-4 h-4" />
            <span>Apply</span>
          </button>

          {(hasActiveFilters || searchTerm) && (
            <button type="button" onClick={handleClearFilters} className="ds-btn-ghost gap-2">
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          selectedInvoicesCount > 0 ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="ds-surface-muted rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 ds-shadow-ring">
          <span className="text-sm font-medium" style={{ color: 'var(--ds-black)' }}>
            {selectedInvoicesCount} {selectedInvoicesCount === 1 ? 'invoice' : 'invoices'} selected
          </span>

          <div className="flex items-center gap-3">
            <button type="button" onClick={onBulkMarkPaid} className="ds-btn-ghost gap-2 py-2 px-3 text-sm">
              <CheckCircle className="w-4 h-4" style={{ color: '#059669' }} />
              <span>Mark Paid</span>
            </button>

            <button
              type="button"
              onClick={onBulkDelete}
              className="ds-btn-ghost gap-2 py-2 px-3 text-sm"
              style={{ color: 'var(--ds-ship-red)' }}
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceFilters;
