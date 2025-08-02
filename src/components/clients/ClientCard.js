

import React from 'react';
import { Mail, Phone, MapPin, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';

// Renamed onDelete to onDeleteClient for clarity
const ClientCard = ({ client, onDelete }) => {
  const initials = client.name.split(' ').map(n => n[0]).join('');

  // Helper to format the currency
  const formattedTotalAmount = (parseFloat(client.totalAmount) || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD', // You can make this dynamic later
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col hover:shadow-md transition-shadow">
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-lg">{initials}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{client.name}</h3>
            <p className="text-sm text-gray-600">{client.company}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${client.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
            {client.status}
          </span>
        </div>
      </div>
      
      
      <div className="space-y-2 mb-4 text-sm text-gray-600">
        <div className="flex items-center space-x-2"><Mail className="w-4 h-4 flex-shrink-0" /><span>{client.email}</span></div>
        {client.phone && <div className="flex items-center space-x-2"><Phone className="w-4 h-4 flex-shrink-0" /><span>{client.phone}</span></div>}
        {client.address && <div className="flex items-center space-x-2"><MapPin className="w-4 h-4 flex-shrink-0" /><span>{client.address}</span></div>}
      </div>
      
      <div className="border-t border-gray-200 pt-4 mt-auto">
       
        <div className="grid grid-cols-2 gap-4 text-center mb-4">
          <div>
            
            <p className="text-lg font-semibold text-gray-900">{client.totalInvoices}</p>
            <p className="text-xs text-gray-600">Invoices</p>
          </div>
          <div>
            
            <p className="text-lg font-semibold text-blue-600">{formattedTotalAmount}</p>
            <p className="text-xs text-gray-600">Total Value</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          
          <span className="text-xs text-gray-500">
            Last invoice: {client.lastInvoice ? new Date(client.lastInvoice).toLocaleDateString() : 'N/A'}
          </span>
          <div className="flex items-center space-x-1">
            <button className="p-1.5 text-gray-400 hover:text-blue-600"><Eye className="w-4 h-4" /></button>
            <button className="p-1.5 text-gray-400 hover:text-emerald-600"><Edit className="w-4 h-4" /></button>
            
            <button onClick={() => onDelete()} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientCard;



/*

import React from 'react';
import { Mail, Phone, MapPin, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';

const ClientCard = ({ client, onDelete }) => {
  const initials = client.name.split(' ').map(n => n[0]).join('');

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-lg">{initials}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{client.name}</h3>
            <p className="text-sm text-gray-600">{client.company}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${client.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
            {client.status}
          </span>
        </div>
      </div>
      
      <div className="space-y-2 mb-4 text-sm text-gray-600">
        <div className="flex items-center space-x-2"><Mail className="w-4 h-4 flex-shrink-0" /><span>{client.email}</span></div>
        <div className="flex items-center space-x-2"><Phone className="w-4 h-4 flex-shrink-0" /><span>{client.phone}</span></div>
        <div className="flex items-center space-x-2"><MapPin className="w-4 h-4 flex-shrink-0" /><span>{client.address}</span></div>
      </div>
      
      <div className="border-t border-gray-200 pt-4 mt-auto">
        <div className="grid grid-cols-2 gap-4 text-center mb-4">
          <div>
            <p className="text-lg font-semibold text-gray-900"> 0 </p>
            <p className="text-xs text-gray-600">Invoices</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-blue-600">RS 0</p>
            <p className="text-xs text-gray-600">Total Value</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Last invoice: {client.lastInvoice}</span>
          <div className="flex items-center space-x-1">
            <button className="p-1.5 text-gray-400 hover:text-blue-600"><Eye className="w-4 h-4" /></button>
            <button className="p-1.5 text-gray-400 hover:text-emerald-600"><Edit className="w-4 h-4" /></button>
            <button onClick={() => onDelete()} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientCard;

*/

