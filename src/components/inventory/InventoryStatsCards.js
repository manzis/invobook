import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, AlertCircle, AlertTriangle } from 'lucide-react';

const InventoryStatsCards = ({ refreshTrigger }) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStockValue: '$0.00',
    lowStockCount: 0,
    outOfStockCount: 0
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="ds-card-static h-32 animate-pulse bg-[var(--ds-gray-50)]" />
        ))}
      </div>
    );
  }

  const cards = [
    { title: 'Total Products', value: stats.totalProducts, icon: Package, colorClass: 'text-[var(--ds-black)]' },
    { title: 'Stock Value', value: stats.totalStockValue, icon: TrendingUp, colorClass: 'text-[var(--ds-vercel-blue)]' },
    { title: 'Low Stock Items', value: stats.lowStockCount, icon: AlertTriangle, colorClass: 'text-[#F5A623]' },
    { title: 'Out of Stock', value: stats.outOfStockCount, icon: AlertCircle, colorClass: 'text-[var(--ds-ship-red)]' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="ds-card-static p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-[var(--ds-gray-500)]">{card.title}</span>
              <div className={`p-2 rounded-md bg-[var(--ds-gray-100)] ${card.colorClass}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-[var(--ds-black)]">{card.value}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InventoryStatsCards;
