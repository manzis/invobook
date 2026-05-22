import React from 'react';
import { User, Plus } from 'lucide-react';

const EmptyClientsState = ({ onAddClientClick }) => {
  return (
    <div className="ds-card-static text-center py-12">
      <User className="w-12 h-12 text-[var(--ds-gray-400)] mx-auto mb-4" />
      <h3 className="ds-card-title text-xl mb-2">No clients found</h3>
      <p className="text-[var(--ds-gray-600)] mb-6">
        Your search returned no results, or you haven&apos;t added a client yet.
      </p>
      <button type="button" onClick={onAddClientClick} className="ds-btn-dark gap-2">
        <Plus className="w-4 h-4" />
        <span>Add First Client</span>
      </button>
    </div>
  );
};

export default EmptyClientsState;
