'use client';

import React from 'react';

const colors = [
  { // Blue
    bg: 'bg-[rgba(0,114,245,0.03)] dark:bg-[rgba(0,114,245,0.08)]',
    border: 'border-[rgba(0,114,245,0.12)] dark:border-[rgba(0,114,245,0.25)]',
    icon: 'text-[#0a72ef] dark:text-[#3b82f6]',
    dot: 'bg-[#0a72ef] dark:bg-[#3b82f6]',
    hover: 'hover:bg-[rgba(0,114,245,0.07)] dark:hover:bg-[rgba(0,114,245,0.14)]',
  },
  { // Green
    bg: 'bg-[rgba(16,185,129,0.03)] dark:bg-[rgba(16,185,129,0.08)]',
    border: 'border-[rgba(16,185,129,0.12)] dark:border-[rgba(16,185,129,0.25)]',
    icon: 'text-[#10b981] dark:text-[#34d399]',
    dot: 'bg-[#10b981] dark:bg-[#34d399]',
    hover: 'hover:bg-[rgba(16,185,129,0.07)] dark:hover:bg-[rgba(16,185,129,0.14)]',
  },
  { // Purple
    bg: 'bg-[rgba(121,40,202,0.03)] dark:bg-[rgba(121,40,202,0.08)]',
    border: 'border-[rgba(121,40,202,0.12)] dark:border-[rgba(121,40,202,0.25)]',
    icon: 'text-[#7928ca] dark:text-[#a855f7]',
    dot: 'bg-[#7928ca] dark:bg-[#a855f7]',
    hover: 'hover:bg-[rgba(121,40,202,0.07)] dark:hover:bg-[rgba(121,40,202,0.14)]',
  },
  { // Yellow
    bg: 'bg-[rgba(245,158,11,0.03)] dark:bg-[rgba(245,158,11,0.08)]',
    border: 'border-[rgba(245,158,11,0.12)] dark:border-[rgba(245,158,11,0.25)]',
    icon: 'text-[#f59e0b] dark:text-[#fbbf24]',
    dot: 'bg-[#f59e0b] dark:bg-[#fbbf24]',
    hover: 'hover:bg-[rgba(245,158,11,0.07)] dark:hover:bg-[rgba(245,158,11,0.14)]',
  }
];

const QuickActions = ({ actions = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, idx) => {
        const Icon = action.icon;
        const color = colors[idx % colors.length];

        return (
          <button
            key={idx}
            type="button"
            onClick={action.onClick}
            className={`text-left w-full cursor-pointer p-5 rounded-xl transition-all duration-150 hover:-translate-y-0.5 ${color.bg} ${color.hover}`}
          >
            <div className="flex items-center justify-between mb-3">
              {Icon && <Icon className={`w-5 h-5 ${color.icon}`} />}
              <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} aria-hidden />
            </div>
            <h4 className="text-base font-semibold text-[var(--ds-black)] mb-1 tracking-[-0.32px]">
              {action.title}
            </h4>
            <p className="text-sm text-[var(--ds-gray-600)]">{action.description}</p>
          </button>
        );
      })}
    </div>
  );
};

export default QuickActions;
