import React, { useMemo } from 'react';
import { User, FileText } from 'lucide-react';

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

const ClientStats = ({ clients }) => {
  const stats = useMemo(() => {
    const totalRevenue = clients.reduce((sum, client) => sum + client.totalAmount, 0);
    const totalInvoices = clients.reduce((sum, client) => sum + client.totalInvoices, 1); // Avoid division by zero
    const avgInvoiceValue = Math.round(totalRevenue / totalInvoices);
    
    return {
      totalClients: clients.length,
      activeClients: clients.filter(c => c.status === 'active').length,
      totalRevenue: totalRevenue.toLocaleString(),
      avgInvoiceValue: avgInvoiceValue.toLocaleString(),
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
        value={`$${stats.totalRevenue}`} 
        icon={<FileText className="w-5 h-5 text-blue-600" />}
        iconBgColor="bg-blue-100"
        valueColor="text-blue-600"
      />
      <StatCard 
        title="Avg. Invoice Value" 
        value={`$${stats.avgInvoiceValue}`}
        icon={<FileText className="w-5 h-5 text-purple-600" />}
        iconBgColor="bg-purple-100"
        valueColor="text-purple-600"
      />
    </div>
  );
};

export default ClientStats;