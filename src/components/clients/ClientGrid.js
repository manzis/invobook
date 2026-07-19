import React from 'react';
import ClientCard from './ClientCard';

// Add onEditClient to the props
const ClientGrid = ({ clients, onEditClient, onDeleteClient, isVendor }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clients.map((client) => (
        <ClientCard 
          key={client.id} 
          client={client} 
          // Pass the entire client object to the edit handler
          onEdit={() => onEditClient(client)}
          onDelete={() => onDeleteClient(client.id)}
          isVendor={isVendor}
        />
      ))}
    </div>
  );
};

export default ClientGrid;