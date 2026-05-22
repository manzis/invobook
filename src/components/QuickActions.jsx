'use client';

import React from 'react';

const QuickActions = ({ actions = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, idx) => {
        const Icon = action.icon;

        return (
          <button
            key={idx}
            type="button"
            onClick={action.onClick}
            className="ds-card text-left w-full cursor-pointer border-none transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-3">
              {Icon && <Icon className="w-5 h-5 text-[var(--ds-gray-500)]" />}
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--ds-gray-100)]" aria-hidden />
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
