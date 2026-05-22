// /components/Invoices/StatsCards.jsx (Final Version with Vercel design)

import React, { useMemo } from 'react';
import { FileText, Receipt, CheckCircle, Clock, AlertCircle } from 'lucide-react';

import { formatCurrency } from '../../utils/InvoicesUtils';

const STAT_ICONS = {
  count: { icon: FileText, color: 'var(--ds-black)' },
  billed: { icon: Receipt, color: 'var(--ds-develop-blue)' },
  collected: { icon: CheckCircle, color: '#059669' },
  outstanding: { icon: Clock, color: 'var(--ds-badge-text)' },
  overdue: { icon: AlertCircle, color: 'var(--ds-ship-red)' },
};

const StatCard = ({ title, value, variant }) => {
  const { icon: Icon, color } = STAT_ICONS[variant];

  return (
    <div className="ds-card-static flex flex-col">
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 ds-surface-muted"
      >
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <p className="ds-stat-label">{title}</p>
      <p className="ds-stat-value m-0">{value}</p>
    </div>
  );
};

const StatsCards = ({ invoices = [], currency = 'USD' }) => {
  const stats = useMemo(() => {
    const format = (amount) => formatCurrency(amount, currency);

    const totalBilledAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
    const totalAmountPaid = invoices.reduce((sum, inv) => sum + parseFloat(inv.amountPaid || 0), 0);
    const totalBalanceDue = invoices.reduce((sum, inv) => sum + parseFloat(inv.balanceDue || 0), 0);
    const overdueAmount = invoices
      .filter((inv) => inv.status === 'OVERDUE')
      .reduce((sum, inv) => sum + parseFloat(inv.balanceDue || 0), 0);

    return {
      totalBilledAmount: format(totalBilledAmount),
      totalAmountPaid: format(totalAmountPaid),
      totalBalanceDue: format(totalBalanceDue),
      overdueAmount: format(overdueAmount),
    };
  }, [invoices]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
      <StatCard title="Total Invoices" value={invoices.length} variant="count" />
      <StatCard title="Total Billed" value={stats.totalBilledAmount} variant="billed" />
      <StatCard title="Total Collected" value={stats.totalAmountPaid} variant="collected" />
      <StatCard title="Total Outstanding" value={stats.totalBalanceDue} variant="outstanding" />
      <StatCard title="Overdue" value={stats.overdueAmount} variant="overdue" />
    </div>
  );
};

export default StatsCards;
