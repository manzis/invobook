// /components/Invoices/InvoiceFilters.jsx (Updated Layout)

import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, Trash2, Filter, X } from 'lucide-react';

const InvoiceFilters = ({ 
    searchTerm, setSearchTerm, 
    statusFilter, setStatusFilter, 
    startDate, setStartDate,
    endDate, setEndDate,
    selectedInvoicesCount, 
    onBulkDelete, 
    onBulkMarkPaid 
}) => {
    const [localStatusFilter, setLocalStatusFilter] = useState(statusFilter);
    const [localStartDate, setLocalStartDate] = useState(startDate);
    const [localEndDate, setLocalEndDate] = useState(endDate);

    useEffect(() => {
        setLocalStatusFilter(statusFilter);
        setLocalStartDate(startDate);
        setLocalEndDate(endDate);
    }, [statusFilter, startDate, endDate]);

    const handleApplyFilters = () => {
        setStatusFilter(localStatusFilter);
        setStartDate(localStartDate);
        setEndDate(localEndDate);
    };
    
    const handleClearFilters = () => {
        setLocalStatusFilter('all');
        setLocalStartDate('');
        setLocalEndDate('');
        setSearchTerm('');
        setStatusFilter('all');
        setStartDate('');
        setEndDate('');
    };

    const hasActiveFilters = statusFilter !== 'all' || startDate || endDate;

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-5">
        
        {/* --- UPDATED TOP ROW --- */}
        {/* This container now pushes the search bar and the other filters apart */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Left Side: Search Bar */}
          <div className="relative grow ">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* Right Side: Group of all other filters and buttons */}
          <div className="flex flex-wrap items-center justify-start md:justify-end gap-4">
            <select
              value={localStatusFilter}
              onChange={(e) => setLocalStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              <option value="all">All Statuses</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="DRAFT">Draft</option>
            </select>
            
            <div className="flex items-center gap-2">
              <label htmlFor="start-date" className="text-sm font-medium text-gray-600 sr-only md:not-sr-only">From:</label>
              <input
                id="start-date"
                type="date"
                value={localStartDate}
                onChange={(e) => setLocalStartDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <label htmlFor="end-date" className="text-sm font-medium text-gray-600 sr-only md:not-sr-only">To:</label>
              <input
                id="end-date"
                type="date"
                value={localEndDate}
                onChange={(e) => setLocalEndDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <button
              onClick={handleApplyFilters}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Apply</span>
            </button>

            {(hasActiveFilters || searchTerm) && (
              <button
                onClick={handleClearFilters}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Improved Bulk Action Bar (No changes needed here) */}
        <div 
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
                selectedInvoicesCount > 0 
                ? 'max-h-40 opacity-100' 
                : 'max-h-0 opacity-0'
            }`}
        >
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-sm text-indigo-800 font-semibold">
                    {selectedInvoicesCount} {selectedInvoicesCount === 1 ? 'invoice' : 'invoices'} selected
                </span>
                
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={onBulkMarkPaid} 
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
                    >
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Mark Paid</span>
                    </button>
                    
                    <button 
                        onClick={onBulkDelete}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                    >
                        <Trash2 className="w-4 h-4 text-red-600" />
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        </div>

      </div>
    );
};

export default InvoiceFilters;