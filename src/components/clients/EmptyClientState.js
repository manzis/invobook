import React from 'react';
import { User, Plus } from 'lucide-react';

const EmptyClientsState = ({ onAddClientClick }) => {
  return (
    <div className="text-center py-12">
      <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
      <p className="text-gray-600 mb-4">Your search returned no results, or you haven't added a client yet.</p>
      <button
        onClick={onAddClientClick}
        className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Add First Client</span>
      </button>
    </div>
  );
};

export default EmptyClientsState;