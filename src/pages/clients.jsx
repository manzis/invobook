// /pages/clients.jsx (Updated)

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import AddClientModal from '../components/AddClientModal';
import ClientListHeader from '../components/clients/ClientHeader';
import ClientStats from '../components/clients/ClientStats';
import ClientSearch from '../components/clients/ClientSearch';
import ClientGrid from '../components/clients/ClientGrid';
import EmptyClientsState from '../components/clients/EmptyClientState';
import { useRouter } from 'next/router'; 

const ClientsPage = () => {
  const [clients, setClients] = useState([]); // Start with an empty array
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter(); 
  
  // Fetch clients when the page loads
  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/clients');
        if (!res.ok) throw new Error("Failed to fetch clients");
        const data = await res.json();
        setClients(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClients();
  }, []);


   useEffect(() => {
    // router.isReady is true when the router has parsed the URL on the client-side
    if (router.isReady) {
      if (router.query.action === 'add') {
        setShowAddModal(true);
        // Optional but recommended: clean the URL so the modal doesn't pop up on refresh
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

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to save the client.");

      if (isEditMode) {
        // Find and update the client in the local state
        setClients(prev => prev.map(c => (c.id === clientId ? result : c)));
      } else {
        // Add the new client to the top of the list
        setClients(prev => [result, ...prev]);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Save Client Error:", error);
      alert(`Error: ${error.message}`); // You can replace this with a more elegant notification
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (clientId) => {
    // 1. Add a confirmation step for better UX
    if (!window.confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
      return;
    }

    try {
      // 2. Make an API call to the specific client delete endpoint
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // If the API returns an error, show an alert
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete the client.");
      }

      // 3. On success, remove the client from the local state to update the UI instantly
      setClients(prevClients => prevClients.filter(client => client.id !== clientId));
      
    } catch (error) {
      console.error("Delete client error:", error);
      alert(`Error: ${error.message}`);
    }
  };

  if (isLoading) {
    return <div>Loading clients...</div>; // Or a proper skeleton loader
  }
return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-4 md:p-8">
        <ClientListHeader onAddClientClick={handleOpenAddModal} />
        <ClientStats clients={clients} />
        <ClientSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {clients.length === 0 ? (
          <EmptyClientsState onAddClientClick={handleOpenAddModal} />
        ) : filteredClients.length > 0 ? (
          <ClientGrid 
            clients={filteredClients} 
            onEditClient={handleOpenEditModal} // Pass the edit handler
            onDeleteClient={handleDeleteClient}
          />
        ) : (
          <div>No clients match your search.</div>
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