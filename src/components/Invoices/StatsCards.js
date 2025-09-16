// /components/Invoices/StatsCards.jsx (Final Version with Thin Borders)

import React, { useMemo } from 'react';
import { FileText, Receipt, CheckCircle, Clock, AlertCircle } from 'lucide-react';

// --- Redesigned StatCard component with a thin border ---
const StatCard = ({ title, value, icon, colorClass }) => {
  // Dynamically create class names for border and icon background
  const borderColor = colorClass.replace('text', 'bg');
  const iconBgColor = colorClass.replace('text', 'bg').replace('-600', '-100').replace('-500', '-100');

  return (
    <div className="flex items-stretch bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300">
      {/* 1. Colorful Left Border - UPDATED from w-1.5 to w-1 for the thinnest look */}
      <div className={`w-1 rounded-l-xl ${borderColor}`} />

      {/* 2. Main content area */}
      <div className="flex flex-col p-6 w-full">
        {/* 3. Icon at the top */}
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${iconBgColor}`}>
          {React.cloneElement(icon, { className: `w-6 h-6 ${colorClass}` })}
        </div>
        
        {/* 4. Text content */}
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );
};

// Main component performing the calculations (No changes needed here)
const StatsCards = ({ invoices = [] }) => {
  const stats = useMemo(() => {
    const formatCurrency = (amount) => {
      return parseFloat(amount || 0).toLocaleString('en-US', {
        style: 'currency',
        currency: 'INR',
      });
    };

    const totalBilledAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
    const totalAmountPaid = invoices.reduce((sum, inv) => sum + parseFloat(inv.amountPaid || 0), 0);
    const totalBalanceDue = invoices.reduce((sum, inv) => sum + parseFloat(inv.balanceDue || 0), 0);
    const overdueAmount = invoices
      .filter(inv => inv.status === 'OVERDUE')
      .reduce((sum, inv) => sum + parseFloat(inv.balanceDue || 0), 0);

    return { 
      totalBilledAmount: formatCurrency(totalBilledAmount),
      totalAmountPaid: formatCurrency(totalAmountPaid), 
      totalBalanceDue: formatCurrency(totalBalanceDue), 
      overdueAmount: formatCurrency(overdueAmount) 
    };
  }, [invoices]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
      <StatCard 
        title="Total Invoices" 
        value={invoices.length} 
        icon={<FileText />} 
        colorClass="text-blue-600"
      />
      <StatCard 
        title="Total Billed" 
        value={stats.totalBilledAmount} 
        icon={<Receipt />} 
        colorClass="text-indigo-600"
      />
      <StatCard 
        title="Total Collected" 
        value={stats.totalAmountPaid} 
        icon={<CheckCircle />} 
        colorClass="text-emerald-600"
      />
      {/* This card for "Total Outstanding" will now have the thin amber border */}
      <StatCard 
        title="Total Outstanding" 
        value={stats.totalBalanceDue} 
        icon={<Clock />} 
        colorClass="text-amber-600" 
      />
      <StatCard 
        title="Overdue" 
        value={stats.overdueAmount} 
        icon={<AlertCircle />} 
        colorClass="text-red-600"
      />
    </div>
  );
};

export default StatsCards;