// /components/Invoices/InvoiceListHeader.jsx (Updated and Final)

import React from 'react';
import { Plus, Eye, EyeOff } from 'lucide-react';

const InvoiceListHeader = ({ showStats, onToggleStats }) => (
  <div className="ds-page-header">
    <div>
      <h1 className="ds-section-title m-0">All Invoices</h1>
      <p className="ds-page-subtitle m-0">Manage and track all your invoices</p>
    </div>

    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onToggleStats}
        className="ds-btn-ghost gap-2"
      >
        {showStats ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        <span>{showStats ? 'Hide Stats' : 'Show Stats'}</span>
      </button>

      <button type="button" className="ds-btn-dark gap-2">
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">New Invoice</span>
        <span className="sm:hidden">New</span>
      </button>
    </div>
  </div>
);

export default InvoiceListHeader;
