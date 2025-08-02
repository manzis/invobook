import React from 'react';
import ClientCard from './ClientCard';

const ClientGrid = ({ clients, onDeleteClient }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clients.map((client) => (
        <ClientCard 
          key={client.id} 
          client={client} 
          onDelete={() => onDeleteClient(client.id)}
        />
      ))}
    </div>
  );
};

export default ClientGrid;