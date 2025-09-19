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
        if (!res.ok) throw new Error("Failed to fetch clients data");
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
    if (router.isReady) {
      if (router.query.action === 'add') {
        // FIX: Use the correct state setter function here
        setIsModalOpen(true); 
        
        // Clean the URL so the modal doesn't pop up on refresh
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

      // THE FIX: Gracefully handle predictable API errors (like 409 Conflict)
      if (!res.ok) {
        // 1. Get the specific error message from your API
        const errorData = await res.json();
        
        // 2. Show the user a simple, clean alert with that message
        alert(errorData.message);
        
        // 3. IMPORTANT: Stop the function here to prevent a crash
        return; 
      }

      // This code only runs on a successful response (200 or 201)
      const result = await res.json();

      if (isEditMode) {
        setClients(prev => prev.map(c => (c.id === clientId ? result : c)));
      } else {
        setClients(prev => [result, ...prev]);
      }
      
      // Close the modal only on success
      handleCloseModal();

    } catch (error) {
      // This 'catch' block is now for unexpected network or runtime errors
      console.error("Save Client Error:", error);
      alert("An unexpected error occurred. Please check your connection and try again.");
    } finally {
      // This will always run, ensuring the submit button is re-enabled
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