import React from 'react';
import { Mail, Phone, Building2, Edit, Trash2 } from 'lucide-react';

const ClientTable = ({ clients, onEditClient, onDeleteClient }) => {
  if (!clients || clients.length === 0) return null;

  return (
    <div className="ds-table-wrap mb-6">
      <div className="overflow-x-auto">
        <table className="ds-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Contact Info</th>
              <th>Address</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => {
              // Same initials logic as ClientGrid
              const nameParts = client.name ? client.name.split(' ') : ['U'];
              let initials = 'U';
              if (nameParts.length >= 2) {
                initials = `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
              } else if (nameParts[0]) {
                initials = nameParts[0][0].toUpperCase();
              }

              return (
                <tr key={client.id} className="group">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                        {initials}
                      </div>
                      <div>
                        <div className="font-medium text-[var(--ds-black)]">{client.name}</div>
                        {client.company && (
                          <div className="flex items-center gap-1 text-[11px] text-[var(--ds-gray-500)] mt-0.5">
                            <Building2 className="w-3 h-3" />
                            {client.company}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-sm text-[var(--ds-gray-600)]">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[200px]">{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-1.5 text-sm text-[var(--ds-gray-500)]">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm text-[var(--ds-gray-600)] max-w-[200px] truncate">
                      {client.address || <span className="text-[var(--ds-gray-400)] italic">No address provided</span>}
                    </div>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onEditClient(client)}
                        className="w-8 h-8 rounded-md hover:bg-[var(--ds-gray-100)] flex items-center justify-center text-[var(--ds-gray-500)] hover:text-blue-600 transition-colors"
                        title="Edit Client"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDeleteClient(client.id)}
                        className="w-8 h-8 rounded-md hover:bg-[var(--ds-gray-100)] flex items-center justify-center text-[var(--ds-gray-500)] hover:text-red-600 transition-colors"
                        title="Delete Client"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientTable;
