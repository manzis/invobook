// components/ClientStats.jsx

import React, { useMemo } from 'react';
import { User, FileText } from 'lucide-react';

/**
 * A robust, centralized helper function for formatting currency.
 * It uses the standard Intl.NumberFormat API for proper formatting.
 * @param {number} amount - The number to format.
 * @param {string} currency - The ISO currency code (e.g., 'INR', 'USD').
 * @returns {string} The formatted currency string.
 */
const formatCurrency = (amount, currency = 'INR') => {
  const numericAmount = parseFloat(amount);
  
  // Return a formatted zero if the input is not a valid number.
  if (isNaN(numericAmount)) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(0);
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    // You can add more options here if needed, e.g., to control decimal places
    // maximumFractionDigits: 0, 
  }).format(numericAmount);
};


// The reusable UI component for a single card (no changes needed here)
const StatCard = ({ title, value, icon, iconBgColor, valueColor }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      </div>
      <div className={`w-10 h-10 ${iconBgColor} rounded-lg flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  </div>
);


/**
 * The main component that performs calculations and renders the cards.
 * @param {Array} clients - The array of client data.
 * @param {string} currency - The currency to use for formatting. Defaults to 'INR'.
 */
const ClientStats = ({ clients, currency = 'INR' }) => {

  const stats = useMemo(() => {
    // Keep calculations as raw numbers inside useMemo for accuracy.
    const totalRevenue = clients.reduce((sum, client) => sum + (client.totalAmount || 0), 0);
    
    // FIX: Start reduce from 0 to get an accurate count of total invoices.
    const totalInvoices = clients.reduce((sum, client) => sum + (client.totalInvoices || 0), 0);
    
    // FIX: Protect against division by zero if there are no invoices.
    const avgInvoiceValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;
    
    return {
      totalClients: clients.length,
      activeClients: clients.filter(c => c.status === 'active').length,
      // Return raw numbers. We will format them during render.
      totalRevenue: totalRevenue,
      avgInvoiceValue: avgInvoiceValue,
    };
  }, [clients]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatCard 
        title="Total Clients" 
        value={stats.totalClients} 
        icon={<User className="w-5 h-5 text-blue-600" />}
        iconBgColor="bg-blue-100"
        valueColor="text-gray-900"
      />
      <StatCard 
        title="Active Clients" 
        value={stats.activeClients} 
        icon={<User className="w-5 h-5 text-emerald-600" />}
        iconBgColor="bg-emerald-100"
        valueColor="text-emerald-600"
      />
      <StatCard 
        title="Total Revenue" 
        // FIX: Use the helper function to format the value dynamically.
        value={formatCurrency(stats.totalRevenue, currency)} 
        icon={<FileText className="w-5 h-5 text-blue-600" />}
        iconBgColor="bg-blue-100"
        valueColor="text-blue-600"
      />
      <StatCard 
        title="Avg. Invoice Value"
        // FIX: Use the helper function here as well.
        value={formatCurrency(stats.avgInvoiceValue, currency)}
        icon={<FileText className="w-5 h-5 text-purple-600" />}
        iconBgColor="bg-purple-100"
        valueColor="text-purple-600"
      />    
    </div>
  );
};

export default ClientStats;