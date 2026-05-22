// /pages/clients.jsx (Updated)

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import AddClientModal from '../components/AddClientModal';
import ClientStats from '../components/clients/ClientStats';
import ClientGrid from '../components/clients/ClientGrid';
import ClientTable from '../components/clients/ClientTable';
import SubNav from '../components/ui/SubNav';
import EmptyClientsState from '../components/clients/EmptyClientState';
import { useRouter } from 'next/router'; 
import { useToast } from '../context/ToastContext';
import { Eye, EyeOff } from 'lucide-react';

const ClientStatsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 animate-pulse">
    {[1, 2, 3].map((idx) => (
      <div key={idx} className="ds-card-static p-6 flex flex-col gap-3">
        <div className="w-12 h-12 rounded-lg bg-[var(--ds-gray-100)]"></div>
        <div className="h-4 bg-[var(--ds-gray-100)] rounded-md w-24"></div>
        <div className="h-8 bg-[var(--ds-gray-100)] rounded-md w-32"></div>
      </div>
    ))}
  </div>
);

const ClientGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
    {[1, 2, 3, 4, 5, 6].map((idx) => (
      <div key={idx} className="ds-card-static p-6 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="w-10 h-10 rounded-full bg-[var(--ds-gray-100)]"></div>
          <div className="w-6 h-6 bg-[var(--ds-gray-100)] rounded"></div>
        </div>
        <div className="h-5 bg-[var(--ds-gray-100)] rounded-md w-32 mt-2"></div>
        <div className="h-4 bg-[var(--ds-gray-100)] rounded-md w-24"></div>
        <div className="h-4 bg-[var(--ds-gray-100)] rounded-md w-28"></div>
        <div className="h-6 bg-[var(--ds-gray-100)] rounded-full w-20 mt-2"></div>
      </div>
    ))}
  </div>
);

const ClientsPage = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState([]); // Start with an empty array
  const [currency, setCurrency] = useState('USD');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showStats, setShowStats] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter(); 
  
  // Initialize stats visibility based on screen size
  useEffect(() => {
    if (window.innerWidth < 768) {
      setShowStats(false);
    }
  }, []);

  // Fetch clients when the page loads
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [clientsRes, settingsRes] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/invoice-settings')
        ]);
        if (!clientsRes.ok) throw new Error("Failed to fetch clients data");
        const data = await clientsRes.json();
        setClients(data);

        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          setCurrency(settings.currency || 'USD');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (router.isReady) {
      if (router.query.action === 'add') {
        setIsModalOpen(true); 
        router.replace('/clients', undefined, { shallow: true });
      }
    }
  }, [router.isReady, router.query]);

  const filteredClients = useMemo(() =>
    clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [clients, searchTerm]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3 columns * 3 rows

  // Reset to page 1 on search filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalItems = filteredClients.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedClients = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredClients, currentPage, itemsPerPage]);

  const handleOpenAddModal = () => {
    setClientToEdit(null); // Ensure we're in "add" mode
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client) => {
    setClientToEdit(client); // Set the client to pre-fill the form
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setClientToEdit(null); // Clear client data on close
  };

  const handleSaveClient = async (formData, clientId) => {
    setIsSubmitting(true);
    const isEditMode = Boolean(clientId);
    const url = isEditMode ? `/api/clients/${clientId}` : '/api/clients';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast(errorData.message);
        return; 
      }

      const result = await res.json();

      if (isEditMode) {
        setClients(prev => prev.map(c => (c.id === clientId ? result : c)));
      } else {
        setClients(prev => [result, ...prev]);
      }
      
      handleCloseModal();
    } catch (error) {
      console.error("Save Client Error:", error);
      toast("An unexpected error occurred. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete the client.");
      }

      setClients(prevClients => prevClients.filter(client => client.id !== clientId));
    } catch (error) {
      console.error("Delete client error:", error);
      toast(`Error: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sticky top-0 z-[40] bg-white w-full pt-6 pb-2">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 w-full">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="ds-section-title m-0">Clients</h1>
              <p className="ds-page-subtitle m-0">Manage your client list and details</p>
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

          <SubNav 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search clients by name, email, or company..."
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onAddNewClick={handleOpenAddModal}
            addNewLabel={
              <>
                <span className="hidden sm:inline">New Client</span>
                <span className="sm:hidden">New</span>
              </>
            }
          />
        </div>
      </div>

      <div className="ds-page-inner relative pb-20 md:pb-0 pt-6">
      {isLoading ? (
        <>
          {showStats && <ClientStatsSkeleton />}
          <ClientGridSkeleton />
        </>
      ) : clients.length === 0 ? (
        <>
          {showStats && <ClientStats clients={clients} currency={currency} />}
          <EmptyClientsState onAddClientClick={handleOpenAddModal} />
        </>
      ) : (
        <>
          {showStats && <ClientStats clients={clients} currency={currency} />}
          {filteredClients.length > 0 ? (
            <>
              {viewMode === 'grid' ? (
                <ClientGrid 
                  clients={paginatedClients} 
                  onEditClient={handleOpenEditModal}
                  onDeleteClient={handleDeleteClient}
                />
              ) : (
                <ClientTable 
                  clients={paginatedClients}
                  onEditClient={handleOpenEditModal}
                  onDeleteClient={handleDeleteClient}
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
                            className={`w-8 h-8 flex items-center justify-center rounded-md font-medium text-xs transition-colors ${
                              currentPage === page
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
          ) : (
            <p className="text-[var(--ds-gray-600)]">No clients match your search.</p>
          )}
        </>
      )}
      </div>

      <AddClientModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveClient}
        clientToEdit={clientToEdit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default ClientsPage;