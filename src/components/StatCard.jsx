// components/StatCard.jsx

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ title, value, change, trend, icon: Icon, color }) => {
  // --- Color Palette Definition ---
  // This maps the 'color' prop to specific, accessible Tailwind CSS classes.
  const theme = {
    blue: { accent: 'bg-blue-500', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
    green: { accent: 'bg-emerald-500', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
    yellow: { accent: 'bg-amber-500', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
    red: { accent: 'bg-red-500', iconBg: 'bg-red-100', iconColor: 'text-red-600' },
  };
  const currentTheme = theme[color] || theme.blue; // Default to blue if color is invalid

  // --- Trend Indicator Logic ---
  // This logic determines the correct icon and text color for the trend.
  let trendIcon = null;
  let trendColorClass = '';
  const isNegativeTrend = title === "Pending Invoices" || title === "Overdue";

  if (trend === 'up') {
    trendIcon = <ArrowUpRight className="w-4 h-4" />;
    trendColorClass = isNegativeTrend ? 'text-red-600' : 'text-emerald-600';
  } else if (trend === 'down') {
    trendIcon = <ArrowDownRight className="w-4 h-4" />;
    trendColorClass = isNegativeTrend ? 'text-emerald-600' : 'text-red-600';
  }

  return (
    // --- Main Card Container ---
    // `relative` allows the accent bar to be positioned. `overflow-hidden` keeps the bar contained.
    // The transition and hover effects create the "lift".
    <div className="relative bg-white p-6 rounded-2xl border border-slate-200 overflow-hidden
                   transition-all duration-300 ease-in-out
                   hover:shadow-lg hover:-translate-y-1">
      
      {/* 1. The Accent Bar: A subtle visual cue for the card's category. */}
      <div className={`absolute top-0 left-0 h-full w-1 ${currentTheme.accent}`}></div>

      {/* 2. The Icon: Positioned at the top for clear identification. */}
      <div className={`w-10 h-10 ${currentTheme.iconBg} rounded-lg flex items-center justify-center mb-4`}>
        <Icon className={`w-5 h-5 ${currentTheme.iconColor}`} />
      </div>

      {/* 3. The Content: Title, Value, and Trend are grouped together. */}
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        
        {/* 4. Visual Hierarchy: The main value is the largest and darkest text. */}
        <p className="text-3xl font-bold text-slate-800 mb-2">{value}</p>
        
        {/* 5. Supporting Info: The trend indicator is smaller and lighter. */}
        {change && trend !== 'neutral' && (
          <div className={`flex items-center space-x-1 ${trendColorClass}`}>
            {trendIcon}
            <span className="text-sm font-semibold">{change}</span>
            <span className="text-sm font-normal text-slate-500">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;