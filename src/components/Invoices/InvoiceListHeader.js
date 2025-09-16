// /components/Invoices/InvoiceListHeader.jsx (Updated and Final)

import React from 'react';
import { Plus, Eye, EyeOff } from 'lucide-react'; // Import Eye and EyeOff icons

// Accept new props: showStats and onToggleStats
const InvoiceListHeader = ({ showStats, onToggleStats }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoices</h1>
      <p className="text-gray-600">Manage and track all your invoices</p>
    </div>

    {/* Container for action buttons */}
    <div className="flex items-center space-x-3">
      {/* --- NEW: Show/Hide Stats Button --- */}
      <button 
        onClick={onToggleStats}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {/* Dynamically render the icon based on the showStats state */}
        {showStats ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        
        {/* Dynamically render the text */}
        <span>{showStats ? 'Hide Stats' : 'Show Stats'}</span>
      </button>

      {/* Existing New Invoice Button */}
      <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        <Plus className="w-4 h-4" />
        <span>New Invoice</span>
      </button>
    </div>
  </div>
);

export default InvoiceListHeader;