// components/QuickActions.jsx
'use client';

import React from 'react';

// This component is now "dumb". It receives an array of actions
// and simply renders them, attaching the onClick handler provided for each.
const QuickActions = ({ actions = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, idx) => {
        // Dynamically get the Icon component from the action object
        const Icon = action.icon;
        
        return (
          <button
            key={idx}
            onClick={action.onClick} // <-- Use the onClick handler from the prop
            className={`${action.color} text-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 text-left group`}
          >
            <div className="flex items-center justify-between mb-3">
              {/* Render the icon if it exists */}
              {Icon && <Icon className="w-6 h-6" />}
              <div className="w-2 h-2 bg-white bg-opacity-30 rounded-full" />
            </div>
            <h4 className="font-semibold text-lg mb-1">{action.title}</h4>
            <p className="text-sm opacity-90">{action.description}</p>
          </button>
        );
      })}
    </div>
  );
};

export default QuickActions;