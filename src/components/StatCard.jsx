// components/StatCard.jsx

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ title, value, change, trend, icon: Icon }) => {

  let trendIcon = null;
  let trendColor = 'text-[var(--ds-gray-500)]';
  const isNegativeTrend = title === 'Pending Invoices' || title === 'Overdue';

  if (trend === 'up') {
    trendIcon = <ArrowUpRight className="w-4 h-4" />;
    trendColor = isNegativeTrend
      ? 'text-[var(--ds-ship-red)]'
      : 'text-[#059669]';
  } else if (trend === 'down') {
    trendIcon = <ArrowDownRight className="w-4 h-4" />;
    trendColor = isNegativeTrend
      ? 'text-[#059669]'
      : 'text-[var(--ds-ship-red)]';
  }

  return (
    <div className="ds-card-static">
      <div className="w-10 h-10 rounded-[var(--ds-radius-button)] bg-[var(--ds-gray-50)] flex items-center justify-center mb-4">
        {Icon && <Icon className="w-5 h-5 text-[var(--ds-gray-600)]" />}
      </div>
      <p className="ds-stat-label">{title}</p>
      <p className="ds-stat-value mt-1 mb-2">{value}</p>
      {change && trend !== 'neutral' && (
        <div className={`flex items-center gap-1 ${trendColor}`}>
          {trendIcon}
          <span className="text-sm font-medium">{change}</span>
          <span className="text-sm font-normal text-[var(--ds-gray-500)]">
            vs last month
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
