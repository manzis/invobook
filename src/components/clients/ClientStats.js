import React, { useMemo } from 'react';
import { User, FileText } from 'lucide-react';
import { formatCurrency } from '../../utils/InvoicesUtils';

const StatCard = ({ title, value, icon, valueClassName = '' }) => (
  <div className="ds-card-static">
    <div className="flex items-center justify-between">
      <div>
        <p className="ds-stat-label">{title}</p>
        <p className={`ds-stat-value ${valueClassName}`}>{value}</p>
      </div>
      <div className="w-10 h-10 ds-surface-muted rounded-[var(--ds-radius-button)] flex items-center justify-center text-[var(--ds-gray-600)]">
        {icon}
      </div>
    </div>
  </div>
);

const ClientStats = ({ clients, currency = 'USD' }) => {
  const stats = useMemo(() => {
    const totalRevenue = clients.reduce((sum, client) => sum + (client.totalAmount || 0), 0);
    const totalInvoices = clients.reduce((sum, client) => sum + (client.totalInvoices || 0), 0);
    const avgInvoiceValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

    return {
      totalClients: clients.length,
      activeClients: clients.filter((c) => c.status === 'active').length,
      totalRevenue,
      avgInvoiceValue,
    };
  }, [clients]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Clients"
        value={stats.totalClients}
        icon={<User className="w-5 h-5" />}
      />
      <StatCard
        title="Active Clients"
        value={stats.activeClients}
        icon={<User className="w-5 h-5" />}
        valueClassName="text-[#059669]"
      />
      <StatCard
        title="Total Revenue"
        value={formatCurrency(stats.totalRevenue, currency)}
        icon={<FileText className="w-5 h-5" />}
      />
      <StatCard
        title="Avg. Invoice Value"
        value={formatCurrency(stats.avgInvoiceValue, currency)}
        icon={<FileText className="w-5 h-5" />}
      />
    </div>
  );
};

export default ClientStats;
