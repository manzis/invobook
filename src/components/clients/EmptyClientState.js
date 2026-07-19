import React from 'react';
import { User, Plus } from 'lucide-react';

const EmptyClientsState = ({ onAddClientClick, isVendor }) => {
  return (
    <div className="ds-card-static text-center py-12">
      <User className="w-12 h-12 text-[var(--ds-gray-400)] mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-[var(--ds-black)] mb-2">
          {isVendor ? 'No vendors found' : 'No clients found'}
        </h3>
        <p className="text-[var(--ds-gray-500)] max-w-sm mx-auto mb-8">
          {isVendor 
            ? "Get started by adding your first vendor. You'll be able to track their purchases and details here."
            : "Get started by adding your first client. You'll be able to track their invoices and details here."}
        </p>
        <button type="button" onClick={onAddClientClick} className="ds-btn-dark mx-auto">
          <Plus className="w-4 h-4 mr-2" />
          {isVendor ? 'Add Vendor' : 'Add Client'}
        </button>
    </div>
  );
};

export default EmptyClientsState;
