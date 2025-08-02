// /components/Invoices/StatsCards.jsx (Corrected and Final)

import React, { useMemo } from 'react';
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

// This is the reusable UI component for a single card. It is correct.
const StatCard = ({ title, value, icon, colorClass }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className={`text-2xl font-bold ${colorClass || 'text-gray-900'}`}>{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass?.replace('text', 'bg')?.replace('-600', '-100')}`}>
        {icon}
      </div>
    </div>
  </div>
);

// This is the main component that performs the calculations.
// It receives the full, unfiltered list of invoices.
const StatsCards = ({ invoices = [] }) => {

  // useMemo is used for performance. The calculations only re-run if the `invoices` array changes.
  const stats = useMemo(() => {
    
    // Helper to format numbers into currency strings (e.g., $1,234.56)
    const formatCurrency = (amount) => {
      // Prisma Decimal can come as a string, so we parse it
      return parseFloat(amount || 0).toLocaleString('en-US', {
        style: 'currency',
        currency: 'INR', // You could make this dynamic later
      });
    };

    const paidAmount = invoices
      .filter(inv => inv.status === 'PAID')
      .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);

    const pendingAmount = invoices
      .filter(inv => inv.status === 'PENDING')
      .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
      
    const overdueAmount = invoices
      .filter(inv => inv.status === 'OVERDUE')
      .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);

    return { 
      paidAmount: formatCurrency(paidAmount), 
      pendingAmount: formatCurrency(pendingAmount), 
      overdueAmount: formatCurrency(overdueAmount) 
    };
  }, [invoices]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatCard 
        title="Total Invoices" 
        value={invoices.length} 
        icon={<FileText className="w-5 h-5 text-blue-600" />} 
        colorClass="text-blue-600" 
      />
      <StatCard 
        title="Paid" 
        value={stats.paidAmount} 
        icon={<CheckCircle className="w-5 h-5 text-emerald-600" />} 
        colorClass="text-emerald-600" 
      />
      <StatCard 
        title="Pending" 
        value={stats.pendingAmount} 
        icon={<Clock className="w-5 h-5 text-amber-600" />} 
        colorClass="text-amber-600" 
      />
      <StatCard 
        title="Overdue" 
        value={stats.overdueAmount} 
        icon={<AlertCircle className="w-5 h-5 text-red-600" />} 
        colorClass="text-red-600" 
      />
    </div>
  );
};

export default StatsCards;