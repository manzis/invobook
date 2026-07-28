import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { CheckCircle, Trash2, X, Check, Download, ChevronDown } from 'lucide-react';
import SubNav from '../ui/SubNav';

const InvoiceFilters = ({
  activeType,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  minAmount,
  setMinAmount,
  maxAmount,
  setMaxAmount,
  sortBy,
  setSortBy,
  selectedInvoicesCount,
  onBulkDelete,
  onBulkMarkPaid,
  onBulkExport,
  viewMode,
  setViewMode,
  onAddNewClick
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const dropdownRef = useRef(null);
  const typeDropdownRef = useRef(null);

  const currentTab = activeType || (router.pathname.includes('quotation') ? 'QUOTATION' : 'SALES');

  const switcher = (
    <div className="relative" ref={typeDropdownRef}>
      <button
        type="button"
        onClick={() => setIsTypeOpen(!isTypeOpen)}
        className="h-[36px] px-2.5 sm:px-3 flex items-center gap-1.5 border border-[var(--ds-gray-100)] hover:bg-[var(--ds-gray-50)] bg-white rounded-md text-xs font-medium text-[var(--ds-gray-700)] hover:text-[var(--ds-black)] transition-colors shadow-sm"
        title="Switch Invoice Type"
      >
        <span>{currentTab === 'QUOTATION' ? 'Quotations' : 'Sales Invoices'}</span>
        <ChevronDown className="w-3.5 h-3.5 text-[var(--ds-gray-400)]" />
      </button>

      {isTypeOpen && (
        <div
          className="absolute left-0 top-[42px] w-40 ds-dropdown-content animate-page-in bg-white border border-[var(--ds-gray-100)] rounded-md py-1 shadow-lg z-50"
          style={{ boxShadow: 'var(--ds-shadow-card-full)' }}
        >
          <button
            type="button"
            onClick={() => {
              setIsTypeOpen(false);
              router.push('/invoices');
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
              currentTab === 'SALES'
                ? 'bg-[var(--ds-gray-50)] text-[var(--ds-black)] font-semibold'
                : 'text-[var(--ds-gray-600)] hover:bg-[var(--ds-gray-50)] hover:text-[var(--ds-black)]'
            }`}
          >
            <span>Sales Invoices</span>
            {currentTab === 'SALES' && <Check className="w-3.5 h-3.5 text-blue-600" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsTypeOpen(false);
              router.push('/quotations');
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
              currentTab === 'QUOTATION'
                ? 'bg-[var(--ds-gray-50)] text-[var(--ds-black)] font-semibold'
                : 'text-[var(--ds-gray-600)] hover:bg-[var(--ds-gray-50)] hover:text-[var(--ds-black)]'
            }`}
          >
            <span>Quotations</span>
            {currentTab === 'QUOTATION' && <Check className="w-3.5 h-3.5 text-blue-600" />}
          </button>
        </div>
      )}
    </div>
  );

  // Click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setIsTypeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasActiveFilters =
    statusFilter !== 'all' ||
    startDate ||
    endDate ||
    minAmount ||
    maxAmount ||
    sortBy !== 'newest';

  const handleClearFilters = () => {
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    setSortBy('newest');
  };

  return (
    <div className="w-full">
      <div className="relative" ref={dropdownRef}>
        <SubNav 
          typeSwitcher={switcher}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by invoice # or client..."
          onFilterClick={() => setIsOpen(!isOpen)}
          hasActiveFilters={hasActiveFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddNewClick={onAddNewClick}
          addNewLabel={
            <>
              <span className="hidden sm:inline">New Invoice</span>
              <span className="sm:hidden">New</span>
            </>
          }
        />

        {/* Filter Popover Dropdown */}
        {isOpen && (
          <div
            className="absolute right-0 top-[48px] w-80 ds-dropdown-content animate-page-in flex flex-col"
            style={{
              boxShadow: 'var(--ds-shadow-card-full)',
              zIndex: 50,
              maxHeight: 'calc(100dvh - 160px)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--ds-gray-100)] bg-[var(--ds-gray-50)] rounded-t-lg shrink-0">
              <span className="text-xs font-semibold text-[var(--ds-black)]">Filters</span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-[11px] text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="overflow-y-auto">
              {/* Status Options */}
              <div className="p-1 border-b border-[var(--ds-gray-100)]">
                <div className="px-2 py-1 text-[10px] font-semibold text-[var(--ds-gray-400)] tracking-wider uppercase select-none">
                  Status
                </div>
                <div className="space-y-0.5">
                  {[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'PAID', label: 'Paid' },
                    { value: 'PENDING', label: 'Pending' },
                    { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
                    { value: 'OVERDUE', label: 'Overdue' },
                    { value: 'DRAFT', label: 'Draft' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setStatusFilter(item.value)}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs text-left transition-colors ${
                        statusFilter === item.value
                          ? 'bg-[var(--ds-gray-50)] text-[var(--ds-black)] font-semibold'
                          : 'text-[var(--ds-gray-600)] hover:bg-[var(--ds-gray-50)]'
                      }`}
                    >
                      <span>{item.label}</span>
                      {statusFilter === item.value && (
                        <Check className="w-3.5 h-3.5 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Filters */}
              <div className="p-2 border-b border-[var(--ds-gray-100)]">
                <div className="px-1 py-1 text-[10px] font-semibold text-[var(--ds-gray-400)] tracking-wider uppercase select-none mb-1">
                  Date Range
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[var(--ds-gray-500)] block mb-1">From</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="ds-input text-xs w-full py-1 px-2 h-7"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--ds-gray-500)] block mb-1">To</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="ds-input text-xs w-full py-1 px-2 h-7"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Options */}
              <div className="p-2">
                <div className="px-1 py-1 text-[10px] font-semibold text-[var(--ds-gray-400)] tracking-wider uppercase select-none mb-1">
                  Advanced Options
                </div>
                
                {/* Min & Max Amount */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <label className="text-[10px] text-[var(--ds-gray-500)] block mb-1">Min Amount ($)</label>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                      className="ds-input text-xs w-full py-1 px-2 h-7"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--ds-gray-500)] block mb-1">Max Amount ($)</label>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value)}
                      className="ds-input text-xs w-full py-1 px-2 h-7"
                    />
                  </div>
                </div>

                {/* Sort By Order */}
                <div>
                  <label className="text-[10px] text-[var(--ds-gray-500)] block mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="ds-select text-xs w-full py-1 px-2 h-7 !h-7"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="amount_desc">Amount: High to Low</option>
                    <option value="amount_asc">Amount: Low to High</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk actions display */}
      {selectedInvoicesCount > 0 && (
        <div className="transition-all duration-300 ease-in-out overflow-hidden mt-3">
          <div className="ds-surface-muted rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3 border border-[var(--ds-gray-200)]">
            <span className="text-xs font-semibold text-[var(--ds-black)]">
              {selectedInvoicesCount} {selectedInvoicesCount === 1 ? 'invoice' : 'invoices'} selected
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onBulkExport}
                className="ds-btn-ghost !h-8 gap-1.5 py-1 px-3 text-xs text-blue-600 hover:text-blue-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>

              <button
                type="button"
                onClick={onBulkMarkPaid}
                className="ds-btn-ghost !h-8 gap-1.5 py-1 px-3 text-xs"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark Paid</span>
              </button>

              <button
                type="button"
                onClick={onBulkDelete}
                className="ds-btn-ghost !h-8 gap-1.5 py-1 px-3 text-xs text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceFilters;
