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
  const filteredInvoices = useMemo(() =>
    invoices.filter(invoice => {
      const clientName = invoice.client?.name?.toLowerCase() || '';
      const invoiceNumber = invoice.invoiceNumber?.toLowerCase() || '';
      const status = invoice.status?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();
      const matchesSearch = clientName.includes(search) || invoiceNumber.includes(search);
      const matchesStatus = statusFilter.toLowerCase() === 'all' || status === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    }), [invoices, searchTerm, statusFilter]);

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
      <div className="p-8">
        <StatsCards invoices={invoices} />
        <InvoiceFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          selectedInvoicesCount={selectedInvoices.length}
          onBulkDelete={() => handleBulkAction('DELETE')}
          onBulkMarkPaid={() => handleBulkAction('MARK_PAID')}
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
        />
        
      </div>
    </div>
  );
};

return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8">
        <InvoiceListHeader />
        {renderContent()}
      </div>
    </div>
  );
};


export default InvoicesPage;