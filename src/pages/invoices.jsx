// /pages/invoices.jsx (Corrected and Final)

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router'; // 1. Import useRouter
import InvoiceListHeader from '../components/Invoices/InvoiceListHeader';
import StatsCards from '../components/Invoices/StatsCards';
import InvoiceFilters from '../components/Invoices/InvoiceFilters';
import InvoiceTable from '../components/Invoices/InvoiceTable';
import EmptyState from '../components/Invoices/EmptyState';

const InvoicesPage = () => {
  // --- 2. Initialize useRouter at the top level of the component ---
  const router = useRouter(); 
  
  // --- All other hooks must also be at the top level ---
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoices, setSelectedInvoices] = useState([]);
    const [showStats, setShowStats] = useState(true);

  const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');

  // --- useEffect for fetching data ---
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

  // --- useMemo for filtering invoices ---
const filteredInvoices = useMemo(() => {
  // Return early if there are no invoices to filter
  if (!invoices) return [];

  return invoices.filter(invoice => {
    // --- 1. Search Term Filtering (Client Name or Invoice Number) ---
    const clientName = invoice.client?.name?.toLowerCase() || '';
    const invoiceNumber = invoice.invoiceNumber?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    const matchesSearch = clientName.includes(search) || invoiceNumber.includes(search);

    // --- 2. Status Filtering ---
    const status = invoice.status?.toLowerCase() || '';
    // Make sure statusFilter exists before calling toLowerCase
    const matchesStatus = !statusFilter || statusFilter.toLowerCase() === 'all' || status === statusFilter.toLowerCase();

    // --- 3. NEW: Date Range Filtering ---
    const invoiceDate = new Date(invoice.date);
    
    // Parse start and end dates. If they are not provided, these will be null.
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    // To make the range inclusive, we adjust the time.
    // Start date should be the very beginning of the selected day (00:00:00).
    if (start) start.setHours(0, 0, 0, 0);
    // End date should be the very end of the selected day (23:59:59).
    if (end) end.setHours(23, 59, 59, 999);
    
    // The invoice date must be after the start date AND before the end date.
    // If a date is not selected, its condition will be true.
    const matchesDate = (!start || invoiceDate >= start) && (!end || invoiceDate <= end);
    
    // --- Combine all filters ---
    // An invoice is included only if it matches all three conditions.
    return matchesSearch && matchesStatus && matchesDate;
  });
}, [invoices, searchTerm, statusFilter, startDate, endDate]);

  // --- Action Handlers ---
  const handleSelectInvoice = (invoiceId) => {
    setSelectedInvoices(prev => prev.includes(invoiceId) ? prev.filter(id => id !== invoiceId) : [...prev, invoiceId]);
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(filteredInvoices.map(invoice => invoice.id));
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
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
  };

  const handleMarkAsPaid = async (invoiceId) => {
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
  };

  const handleDownloadPDF = (invoiceId) => {
    console.log('Download PDF:', invoiceId);
  };
  
  const handleInvoiceEdit = (invoiceId) => {
    // Now `router` is defined and this will work
    router.push(`/edit-invoice/${invoiceId}`);
  };

  const handleUpdateInvoiceState = (updatedInvoice) => {
    setInvoices(currentInvoices =>
      currentInvoices.map(inv =>
        inv.id === updatedInvoice.id ? updatedInvoice : inv
      )
    );
  };

  const handleBulkAction = async (action) => {
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
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex-1 flex items-center justify-center p-16">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      );
    }

    // --- NEW: This is the core logic for the empty state ---
    // If loading is finished and there are no invoices at all, show the EmptyState component.
    if (invoices.length === 0) {
      return <EmptyState onNewInvoiceClick={() => router.push('/new-invoice')} />;
    }

  return (
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
  setEndDate={setEndDate}Í
        />

        <InvoiceTable
          invoices={filteredInvoices}
          selectedInvoices={selectedInvoices}
          onSelectAll={handleSelectAll}
          onSelectInvoice={handleSelectInvoice}
          onMarkAsPaid={handleMarkAsPaid}
          onDeleteInvoice={handleDeleteInvoice}
          onDownloadPDF={handleDownloadPDF}
          onEditInvoice={handleInvoiceEdit}
          onUpdateInvoiceState={handleUpdateInvoiceState} 
          
        />
        
    </div>
  );
};

return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-4 md:p-8">
        <InvoiceListHeader 
           showStats={showStats}
          onToggleStats={() => setShowStats(prev => !prev)}/>
        {renderContent()}
      </div>
    </div>
  );
};


export default InvoicesPage;