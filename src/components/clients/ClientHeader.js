import React from 'react';
import { Plus } from 'lucide-react';

const ClientListHeader = ({ onAddClientClick }) => {
  return (
    <div className="ds-page-header">
      <div>
        <h1 className="ds-section-title">Clients</h1>
        <p className="ds-page-subtitle">Manage your client relationships and contact information</p>
      </div>
      <button type="button" onClick={onAddClientClick} className="ds-btn-dark gap-2">
        <Plus className="w-4 h-4" />
        <span>Add Client</span>
      </button>
    </div>
  );
};

export default ClientListHeader;
