// /components/Invoices/InvoiceFilters.jsx (Updated)

import React from 'react';
import { Search, CheckCircle, Trash2 } from 'lucide-react'; // Import icons

// Accept the new props: onBulkDelete and onBulkMarkPaid
const InvoiceFilters = ({ 
    searchTerm, setSearchTerm, 
    statusFilter, setStatusFilter, 
    selectedInvoicesCount, 
    onBulkDelete, 
    onBulkMarkPaid 
}) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
      <div className="flex flex-wrap gap-4 items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
          <option value="draft">Draft</option>
        </select>
      </div>
      
      {/* Conditionally render the action bar */}
      {selectedInvoicesCount > 0 && (
        <div className="flex items-center space-x-3 bg-gray-100 p-2 rounded-lg">
          <span className="text-sm text-gray-600 font-medium">{selectedInvoicesCount} selected</span>
          
          {/* Connect the onClick handlers */}
          <button 
            onClick={onBulkMarkPaid} 
            className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Mark Paid</span>
          </button>
          <button 
            onClick={onBulkDelete} 
            className="flex items-center space-x-1.5 px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  </div>
);

export default InvoiceFilters;