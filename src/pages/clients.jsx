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
  const [showAddModal, setShowAddModal] = useState(false);
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
  
  // Handle adding a client
  const handleAddClient = (newClient) => {
    setClients(prev => [newClient, ...prev]); // Add new client to the top of the list
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
      <div className="p-8">
        <ClientListHeader onAddClientClick={() => setShowAddModal(true)} />
        <ClientStats clients={clients} />
        <ClientSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {clients.length === 0 ? (
          <EmptyClientsState onAddClientClick={() => setShowAddModal(true)} />
        ) : filteredClients.length > 0 ? (
          <ClientGrid clients={filteredClients} onDeleteClient={handleDeleteClient} />
        ) : (
          <div>No clients match your search.</div> // Search returned no results
        )}
      </div>

      <AddClientModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        onClientAdded={handleAddClient} 
      />
    </div>
  );
};

export default ClientsPage;