'use client';

// 1. Import useCallback
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Eye, EyeOff } from 'lucide-react';
import InvoiceFilters from '../components/Invoices/InvoiceFilters';
import InvoiceTable from '../components/Invoices/InvoiceTable';
import InvoiceGrid from '../components/Invoices/InvoiceGrid';
import StatsCards from '../components/Invoices/StatsCards';
import EmptyState from '../components/Invoices/EmptyState';
import { useToast } from '../context/ToastContext';

const InvoicesStatsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8 animate-pulse">
    {[1, 2, 3, 4, 5].map((idx) => (
      <div key={idx} className="ds-card-static flex flex-col gap-3">
        <div className="w-12 h-12 rounded-lg bg-[var(--ds-gray-100)]"></div>
        <div className="h-4 bg-[var(--ds-gray-100)] rounded-md w-24"></div>
        <div className="h-8 bg-[var(--ds-gray-100)] rounded-md w-32"></div>
      </div>
    ))}
  </div>
);

const InvoicesTableSkeleton = () => (
  <div className="ds-table-wrap animate-pulse">
    <div className="overflow-x-auto">
      <table className="ds-table">
        <thead>
          <tr>
            <th><div className="w-4 h-4 bg-[var(--ds-gray-100)] rounded"></div></th>
            <th>Invoice</th>
            <th>Client</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map((idx) => (
            <tr key={idx}>
              <td><div className="w-4 h-4 bg-[var(--ds-gray-100)] rounded"></div></td>
              <td><div className="h-4 bg-[var(--ds-gray-100)] rounded-md w-16"></div></td>
              <td><div className="h-4 bg-[var(--ds-gray-100)] rounded-md w-24"></div></td>
              <td><div className="h-4 bg-[var(--ds-gray-100)] rounded-md w-20"></div></td>
              <td><div className="h-4 bg-[var(--ds-gray-100)] rounded-md w-24"></div></td>
              <td><div className="h-4 bg-[var(--ds-gray-100)] rounded-md w-24"></div></td>
              <td><div className="h-5 bg-[var(--ds-gray-100)] rounded-full w-16"></div></td>
              <td><div className="h-4 bg-[var(--ds-gray-100)] rounded-md w-12"></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const QuotationsPage = () => {
  const router = useRouter();
  const { toast } = useToast();

  const [invoices, setInvoices] = useState([]);
  const [currency, setCurrency] = useState('USD');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [showStats, setShowStats] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Initialize view mode based on screen size on client-side
  // Initialize view mode and stats visibility based on screen size on client-side
  useEffect(() => {
    if (window.innerWidth < 768) {
      setViewMode('grid');
      setShowStats(false);
    }
  }, []);

  // --- useEffect for fetching data ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [invoicesRes, settingsRes] = await Promise.all([
          fetch('/api/invoices?type=QUOTATION'),
          fetch('/api/invoice-settings')
        ]);
        if (!invoicesRes.ok) {
          const errorData = await invoicesRes.json();
          throw new Error(errorData.message || 'Failed to fetch invoices');
        }
        const data = await invoicesRes.json();
        setInvoices(data);

        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          setCurrency(settings.currency || 'USD');
        }
      } catch (error) {
        console.error("Fetch Data Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- useMemo for filtering invoices ---
  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    let result = invoices.filter(invoice => {
      const clientName = invoice.client?.name?.toLowerCase() || '';
      const invoiceNumber = invoice.invoiceNumber?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();
      const matchesSearch = clientName.includes(search) || invoiceNumber.includes(search);
      const status = invoice.status?.toLowerCase() || '';
      const matchesStatus = !statusFilter || statusFilter.toLowerCase() === 'all' || status === statusFilter.toLowerCase();
      const invoiceDate = new Date(invoice.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(23, 59, 59, 999);
      const matchesDate = (!start || invoiceDate >= start) && (!end || invoiceDate <= end);

      const amt = Number(invoice.total) || 0;
      const matchesMin = minAmount === '' || amt >= Number(minAmount);
      const matchesMax = maxAmount === '' || amt <= Number(maxAmount);

      return matchesSearch && matchesStatus && matchesDate && matchesMin && matchesMax;
    });

    // Sorting
    return [...result].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date) - new Date(a.date);
      }
      if (sortBy === 'oldest') {
        return new Date(a.date) - new Date(b.date);
      }
      if (sortBy === 'amount_desc') {
        return Number(b.total) - Number(a.total);
      }
      if (sortBy === 'amount_asc') {
        return Number(a.total) - Number(b.total);
      }
      return 0;
    });
  }, [invoices, searchTerm, statusFilter, startDate, endDate, minAmount, maxAmount, sortBy]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, startDate, endDate, minAmount, maxAmount, sortBy]);

  const totalItems = filteredInvoices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedInvoices = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredInvoices, currentPage, itemsPerPage]);

  // --- STABILIZED ACTION HANDLERS with useCallback ---
  const handleSelectInvoice = useCallback((invoiceId) => {
    setSelectedInvoices(prev => prev.includes(invoiceId) ? prev.filter(id => id !== invoiceId) : [...prev, invoiceId]);
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedInvoices.length === paginatedInvoices.length && paginatedInvoices.length > 0) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(paginatedInvoices.map(invoice => invoice.id));
    }
  }, [selectedInvoices.length, paginatedInvoices]);

  const handleDeleteInvoice = useCallback(async (invoiceId) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    const originalInvoices = [...invoices];
    setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete the invoice on the server.");
    } catch (error) {
      console.error(error);
      toast("Error: Could not delete the invoice.");
      setInvoices(originalInvoices);
    }
  }, [invoices]); // Depends on the `invoices` state.

  const handleMarkAsPaid = useCallback(async (invoiceId) => {
    const originalInvoices = [...invoices];
    setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: 'PAID' } : inv));
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAID' }),
      });
      if (!res.ok) throw new Error("Failed to update status.");
      const updatedInvoice = await res.json();
      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? updatedInvoice : inv));
    } catch (error) {
      console.error(error);
      toast("Error: Could not mark as paid.");
      setInvoices(originalInvoices);
    }
  }, [invoices]);

  // Note: onDownloadPDF is just a placeholder here, the real logic is in InvoiceTableRow
  const handleDownloadPDF = useCallback((invoiceId) => {
    console.log('Download PDF requested for:', invoiceId);
  }, []);

  const handleInvoiceEdit = useCallback((invoiceId) => {
    router.push(`/edit-invoice/${invoiceId}`);
  }, [router]);

  const handleUpdateInvoiceState = useCallback((updatedInvoice) => {
    setInvoices(currentInvoices =>
      currentInvoices.map(inv =>
        inv.id === updatedInvoice.id ? updatedInvoice : inv
      )
    );
  }, []);

  const handleBulkAction = useCallback(async (action) => {
    const originalInvoices = [...invoices];
    const actionText = action.toLowerCase().replace('_', ' ');
    if (!window.confirm(`Are you sure you want to ${actionText} ${selectedInvoices.length} selected invoices?`)) return;

    let updatedInvoices = [...invoices];
    if (action === 'DELETE') {
      updatedInvoices = invoices.filter(inv => !selectedInvoices.includes(inv.id));
    } else if (action === 'MARK_PAID') {
      updatedInvoices = invoices.map(inv => selectedInvoices.includes(inv.id) ? { ...inv, status: 'PAID' } : inv);
    }
    setInvoices(updatedInvoices);
    const selectedIds = [...selectedInvoices];
    setSelectedInvoices([]);

    try {
      const res = await fetch('/api/invoices/bulk-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceIds: selectedIds, action }),
      });
      if (!res.ok) throw new Error(`Failed to ${actionText} invoices.`);
      if (action === 'MARK_PAID') {
        const updatedData = await fetch('/api/invoices').then(res => res.json());
        setInvoices(updatedData);
      }
    } catch (error) {
      console.error(error);
      toast(`Error: Could not ${actionText} quotations.`);
      setInvoices(originalInvoices);
    }
  }, [invoices, selectedInvoices]);

  const handleConvertQuotation = useCallback(async (invoiceId) => {
    if (!window.confirm("Are you sure you want to convert this quotation to a sales invoice?")) return;
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/convert`, { method: 'POST' });
      if (!res.ok) throw new Error("Failed to convert the quotation.");
      toast("Quotation converted successfully!");
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    } catch (error) {
      console.error(error);
      toast("Error: Could not convert quotation.");
    }
  }, []);

  const handleBulkExport = useCallback(() => {
    if (selectedInvoices.length === 0) return;
    window.open(`/api/invoices/export-pdf?ids=${selectedInvoices.join(',')}`);
  }, [selectedInvoices]);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sticky top-0 z-[40] bg-white w-full pt-6 pb-2">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 w-full">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="ds-section-title m-0">All Quotations</h1>
              <p className="ds-page-subtitle m-0">Manage and track all your quotations</p>
            </div>
            <button 
              onClick={() => setShowStats(prev => !prev)} 
              className="ds-btn-ghost gap-2 h-9 px-3 text-sm text-[var(--ds-gray-600)] hover:text-[var(--ds-black)] transition-colors"
            >
              {showStats ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="hidden sm:inline">{showStats ? 'Hide Stats' : 'Show Stats'}</span>
              <span className="sm:hidden">{showStats ? 'Hide' : 'Show'}</span>
            </button>
          </div>

          <InvoiceFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            selectedInvoicesCount={selectedInvoices.length}
            onBulkDelete={() => handleBulkAction('DELETE')}
            onBulkMarkPaid={() => handleBulkAction('MARK_PAID')}
            onBulkExport={handleBulkExport}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            minAmount={minAmount}
            setMinAmount={setMinAmount}
            maxAmount={maxAmount}
            setMaxAmount={setMaxAmount}
            sortBy={sortBy}
            setSortBy={setSortBy}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onAddNewClick={() => router.push('/new-invoice')}
          />
        </div>
      </div>

      <div className="ds-page-inner relative pb-20 md:pb-0 pt-6">
      {isLoading ? (
        <>
          {showStats && <InvoicesStatsSkeleton />}
          <InvoicesTableSkeleton />
        </>
      ) : invoices.length === 0 ? (
        <EmptyState onNewInvoiceClick={() => router.push('/new-invoice')} />
      ) : (
        <>
          {showStats && <StatsCards invoices={invoices} currency={currency} isQuotation={true} />}
          {viewMode === 'list' ? (
            <InvoiceTable
              invoices={paginatedInvoices}
              selectedInvoices={selectedInvoices}
              onSelectAll={handleSelectAll}
              onSelectInvoice={handleSelectInvoice}
              onMarkAsPaid={handleMarkAsPaid}
              onDeleteInvoice={handleDeleteInvoice}
              onDownloadPDF={handleDownloadPDF}
              onEditInvoice={handleInvoiceEdit}
              onUpdateInvoiceState={handleUpdateInvoiceState}
              currency={currency}
              isQuotation={true}
              onConvert={handleConvertQuotation}
            />
          ) : (
            <InvoiceGrid
              invoices={paginatedInvoices}
              currency={currency}
              onEditInvoice={handleInvoiceEdit}
              onDeleteInvoice={handleDeleteInvoice}
              onMarkAsPaid={handleMarkAsPaid}
              onDownloadPDF={handleDownloadPDF}
              onUpdateInvoiceState={handleUpdateInvoiceState}
              isQuotation={true}
              onConvert={handleConvertQuotation}
            />
          )}

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[var(--ds-gray-100)] pt-6 mt-6 gap-4">
              <div className="text-sm text-[var(--ds-gray-500)] font-medium">
                Showing <span className="font-semibold text-[var(--ds-black)]">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span>–
                <span className="font-semibold text-[var(--ds-black)]">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                <span className="font-semibold text-[var(--ds-black)]">{totalItems}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="ds-btn-ghost !h-[32px] !px-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (totalPages > 5 && Math.abs(page - currentPage) > 1 && page !== 1 && page !== totalPages) {
                      if (page === 2 || page === totalPages - 1) {
                        return <span key={page} className="text-[var(--ds-gray-400)] px-1">...</span>;
                      }
                      return null;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded-md font-medium text-xs transition-colors ${currentPage === page
                          ? 'bg-[var(--ds-black)] text-[var(--ds-white)]'
                          : 'text-[var(--ds-gray-600)] hover:bg-[var(--ds-gray-50)]'
                          }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ds-btn-ghost !h-[32px] !px-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
};

export default QuotationsPage;