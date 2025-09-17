// /pages/invoices.jsx (Corrected with useCallback for Stability)

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react'; // 1. Import useCallback
import { useRouter } from 'next/router';
import InvoiceListHeader from '../components/Invoices/InvoiceListHeader';
import StatsCards from '../components/Invoices/StatsCards';
import InvoiceFilters from '../components/Invoices/InvoiceFilters';
import InvoiceTable from '../components/Invoices/InvoiceTable';
import EmptyState from '../components/Invoices/EmptyState';

const InvoicesPage = () => {
  const router = useRouter(); 
  
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [showStats, setShowStats] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // --- useEffect for fetching data (Correct, no changes needed) ---
  useEffect(() => {
    const fetchInvoices = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/invoices');
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to fetch invoices');
        }
        const data = await res.json();
        setInvoices(data);
      } catch (error) {
        console.error("Fetch Invoices Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  // --- useMemo for filtering invoices (Correct, no changes needed) ---
  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    return invoices.filter(invoice => {
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
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [invoices, searchTerm, statusFilter, startDate, endDate]);

  // --- STABILIZED ACTION HANDLERS with useCallback ---

  const handleSelectInvoice = useCallback((invoiceId) => {
    setSelectedInvoices(prev => prev.includes(invoiceId) ? prev.filter(id => id !== invoiceId) : [...prev, invoiceId]);
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(filteredInvoices.map(invoice => invoice.id));
    }
  }, [selectedInvoices.length, filteredInvoices]);

  const handleDeleteInvoice = useCallback(async (invoiceId) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    const originalInvoices = [...invoices];
    setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete the invoice on the server.");
    } catch (error) {
      console.error(error);
      alert("Error: Could not delete the invoice.");
      setInvoices(originalInvoices);
    }
  }, [invoices]);

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
      alert("Error: Could not mark as paid.");
      setInvoices(originalInvoices);
    }
  }, [invoices]);
  
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
      alert(`Error: Could not ${actionText} invoices.`);
      setInvoices(originalInvoices);
    }
  }, [invoices, selectedInvoices]);

  // --- Render logic (no changes here, but removed the inner function anti-pattern for clarity) ---
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-4 md:p-8">
        <InvoiceListHeader 
           showStats={showStats}
          onToggleStats={() => setShowStats(prev => !prev)}
        />
        
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-16">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState onNewInvoiceClick={() => router.push('/new-invoice')} />
        ) : (
          <div className="flex-1 overflow-auto bg-gray-50">
            {showStats && <StatsCards invoices={invoices} />}
            <InvoiceFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              selectedInvoicesCount={selectedInvoices.length}
              onBulkDelete={() => handleBulkAction('DELETE')}
              onBulkMarkPaid={() => handleBulkAction('MARK_PAID')}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
            />
            <InvoiceTable
              invoices={filteredInvoices}
              selectedInvoices={selectedInvoices}
              onSelectAll={handleSelectAll}
              onSelectInvoice={handleSelectInvoice}
              onMarkAsPaid={handleMarkAsPaid}
              onDeleteInvoice={handleDeleteInvoice}
              onEditInvoice={handleInvoiceEdit}
              onUpdateInvoiceState={handleUpdateInvoiceState}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicesPage;