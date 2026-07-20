// /components/inventory/InventoryStatsCards.js
import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, AlertCircle, AlertTriangle, Star, Percent } from 'lucide-react';

const InventoryStatsCards = ({ refreshTrigger }) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStockValue: '$0.00',
    lowStockCount: 0,
    outOfStockCount: 0,
    averageProfitMargin: '0%',
    topProductStr: 'None'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/inventory/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch inventory stats', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 mb-8">
        <div>
          <div className="h-4 w-32 bg-[var(--ds-gray-100)] rounded mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={`s1-${i}`} className="ds-card-static h-32 animate-pulse bg-[var(--ds-gray-50)]" />
            ))}
          </div>
        </div>
        <div>
          <div className="h-4 w-24 bg-[var(--ds-gray-100)] rounded mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={`s2-${i}`} className="ds-card-static h-32 animate-pulse bg-[var(--ds-gray-50)]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderCard = (card, idx) => {
    const Icon = card.icon;
    return (
      <div key={idx} className="ds-card-static p-5 flex flex-col justify-between hover:-translate-y-1 transition-transform">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ds-gray-500)]">{card.title}</span>
          <div className={`p-1.5 rounded-md bg-[var(--ds-gray-100)] ${card.colorClass}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--ds-black)] truncate" title={card.value}>{card.value}</h3>
        </div>
      </div>
    );
  };

  const analyticsCards = [
    { title: 'Total Products', value: stats.totalProducts, icon: Package, colorClass: 'text-[var(--ds-black)]' },
    { title: 'Stock Value', value: stats.totalStockValue, icon: TrendingUp, colorClass: 'text-[var(--ds-vercel-blue)]' },
    { title: 'Top Product', value: stats.topProductStr, icon: Star, colorClass: 'text-amber-500' },
    { title: 'Avg Profit Margin', value: stats.averageProfitMargin, icon: Percent, colorClass: 'text-emerald-500' },
  ];

  const alertCards = [
    { title: 'Low Stock Items', value: stats.lowStockCount, icon: AlertTriangle, colorClass: 'text-[#F5A623]' },
    { title: 'Out of Stock', value: stats.outOfStockCount, icon: AlertCircle, colorClass: 'text-[var(--ds-ship-red)]' }
  ];

  return (
    <div className="flex flex-col gap-8 mb-8">
      {/* Overview & Performance Group */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--ds-gray-500)] uppercase tracking-wider mb-4 pl-1">Overview & Performance</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {analyticsCards.map((card, idx) => renderCard(card, idx))}
        </div>
      </div>

      {/* Stock Alerts Group */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--ds-gray-500)] uppercase tracking-wider mb-4 pl-1">Stock Alerts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {alertCards.map((card, idx) => renderCard(card, idx))}
        </div>
      </div>
    </div>
  );
};

export default InventoryStatsCards;
