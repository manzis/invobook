import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const dropdownRef = useRef(null);
  const mobileSheetRef = useRef(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTab = activeType || (router.pathname.includes('quotation') ? 'QUOTATION' : 'SALES');

  const switcher = (
    <div className="flex-1 sm:flex-initial flex items-center border border-[var(--ds-gray-100)] rounded-md bg-[var(--ds-gray-50)] p-0.5 h-[36px]">
      <button
        type="button"
        onClick={() => router.push('/invoices')}
        className={`flex-1 sm:flex-initial h-full px-3 flex items-center justify-center rounded-sm text-[11px] sm:text-xs font-medium transition-all ${
          currentTab === 'SALES'
            ? 'bg-white shadow-sm text-[var(--ds-black)] font-semibold'
            : 'text-[var(--ds-gray-500)] hover:text-[var(--ds-black)]'
        }`}
        title="Sales Invoices"
      >
        <span>Sale</span>
      </button>
      <button
        type="button"
        onClick={() => router.push('/quotations')}
        className={`flex-1 sm:flex-initial h-full px-3 flex items-center justify-center rounded-sm text-[11px] sm:text-xs font-medium transition-all ${
          currentTab === 'QUOTATION'
            ? 'bg-white shadow-sm text-[var(--ds-black)] font-semibold'
            : 'text-[var(--ds-gray-500)] hover:text-[var(--ds-black)]'
        }`}
        title="Quotations"
      >
        <span className="hidden sm:inline">Quotation</span>
        <span className="sm:hidden">Quote</span>
      </button>
    </div>
  );

  // Click outside handler to close dropdown on desktop or backdrop touch on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
        return;
      }
      if (mobileSheetRef.current && mobileSheetRef.current.contains(event.target)) {
        return;
      }
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
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

  const filterBody = (
    <div className="flex flex-col">
      {/* Status Options */}
      <div className="p-2 border-b border-[var(--ds-gray-100)]">
        <div className="px-2 py-1 text-[10px] font-semibold text-[var(--ds-gray-400)] tracking-wider uppercase select-none">
          Status
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-1 sm:space-y-0.5 sm:gap-0">
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
              className={`w-full flex items-center justify-between px-2.5 py-2 sm:py-1.5 rounded-md text-xs text-left transition-colors ${
                statusFilter === item.value
                  ? 'bg-[var(--ds-gray-100)] text-[var(--ds-black)] font-semibold'
                  : 'text-[var(--ds-gray-600)] hover:bg-[var(--ds-gray-50)]'
              }`}
            >
              <span>{item.label}</span>
              {statusFilter === item.value && (
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Date Filters */}
      <div className="p-3 sm:p-2 border-b border-[var(--ds-gray-100)]">
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
              className="ds-input text-xs w-full py-1.5 sm:py-1 px-2 h-8 sm:h-7"
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--ds-gray-500)] block mb-1">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="ds-input text-xs w-full py-1.5 sm:py-1 px-2 h-8 sm:h-7"
            />
          </div>
        </div>
      </div>

      {/* Advanced Options */}
      <div className="p-3 sm:p-2">
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
              className="ds-input text-xs w-full py-1.5 sm:py-1 px-2 h-8 sm:h-7"
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--ds-gray-500)] block mb-1">Max Amount ($)</label>
            <input
              type="number"
              placeholder="Max"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="ds-input text-xs w-full py-1.5 sm:py-1 px-2 h-8 sm:h-7"
            />
          </div>
        </div>

        {/* Sort By Order */}
        <div>
          <label className="text-[10px] text-[var(--ds-gray-500)] block mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="ds-select text-xs w-full py-1.5 sm:py-1 px-2 h-8 sm:h-7 !h-8 sm:!h-7"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount_desc">Amount: High to Low</option>
            <option value="amount_asc">Amount: Low to High</option>
          </select>
        </div>
      </div>
    </div>
  );

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

        {/* Filter Popover Dropdown (Desktop) */}
        {isOpen && (
          <div
            className="hidden sm:flex absolute right-0 top-full mt-2 w-80 ds-dropdown-content animate-page-in flex-col"
            style={{
              boxShadow: 'var(--ds-shadow-card-full)',
              zIndex: 50,
              maxHeight: 'calc(100dvh - 160px)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--ds-gray-100)] bg-[var(--ds-gray-50)] rounded-t-lg shrink-0">
              <div className="flex items-center gap-2">
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
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 -mr-1 text-[var(--ds-gray-400)] hover:text-[var(--ds-black)] rounded transition-colors"
                title="Close filters"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-y-auto">
              {filterBody}
            </div>
          </div>
        )}

        {/* Filter Bottom Sheet (Mobile) rendered via portal to sit above MobileBottomNav */}
        {isOpen && mounted && typeof document !== 'undefined' && createPortal(
          <div className="sm:hidden fixed inset-0 z-[9999] flex flex-col justify-end">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Bottom Sheet */}
            <div 
              ref={mobileSheetRef}
              className="relative w-full bg-white rounded-t-2xl shadow-2xl flex flex-col max-h-[82dvh] animate-page-in overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              {/* Top pill handle */}
              <div className="w-10 h-1 bg-[var(--ds-gray-200)] rounded-full mx-auto mt-2.5 mb-1 shrink-0" />
              
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--ds-gray-100)] shrink-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-semibold text-[var(--ds-black)]">Filters</span>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 -mr-1 text-[var(--ds-gray-500)] hover:text-[var(--ds-black)] rounded-full hover:bg-[var(--ds-gray-100)] transition-colors"
                  title="Close filters"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable filter list */}
              <div className="overflow-y-auto flex-1 overscroll-contain">
                {filterBody}
              </div>

              {/* Bottom Action button */}
              <div className="p-3 border-t border-[var(--ds-gray-100)] bg-white pb-[calc(0.75rem+env(safe-area-inset-bottom))] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full h-10 flex items-center justify-center bg-[var(--ds-black)] text-white text-xs font-semibold rounded-lg hover:bg-[#333] active:scale-[0.98] transition-all shadow-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>,
          document.body
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
