import React from 'react';
import { Plus } from 'lucide-react';

const ClientListHeader = ({ onAddClientClick }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Clients data</h1>
        <p className="text-gray-600">Manage your client relationships and contact information</p>
      </div>
      <button
        onClick={onAddClientClick}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Add Client</span>
      </button>
    </div>
  );
};

export default ClientListHeader;