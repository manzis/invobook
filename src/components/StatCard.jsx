// components/StatCard.jsx

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ title, value, change, trend, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    yellow: 'from-amber-500 to-amber-600',
    red: 'from-red-500 to-red-600',
  };

  let trendIcon = null;
  let trendColorClass = '';

  // Business logic for trend colors and icons
  const isNegativeTrend = title === "Pending Invoices" || title === "Overdue";
  if (trend === 'up') {
    trendIcon = <ArrowUpRight className="w-4 h-4" />;
    trendColorClass = isNegativeTrend ? 'text-red-600' : 'text-emerald-600';
  } else if (trend === 'down') {
    trendIcon = <ArrowDownRight className="w-4 h-4" />;
    trendColorClass = isNegativeTrend ? 'text-emerald-600' : 'text-red-600';
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          
          {change && trend !== 'neutral' && (
            <div className={`flex items-center space-x-1 ${trendColorClass}`}>
              {trendIcon}
              <span className="text-sm font-semibold">
                {change}
              </span>
              
              {/* CHANGE HERE: Lighter font for the label */}
              <span className="text-sm font-normal text-gray-500 ml-1">
                vs last month
              </span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center shadow-sm`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;