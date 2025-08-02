
// components/QuickActions.jsx
'use client';

import {
  PlusCircle,
  Users,
  FileText,
  Download,
} from 'lucide-react';

const QuickActions = () => {
  const actions = [
    {
      title: 'New Invoice',
      description: 'Create a new invoice',
      icon: PlusCircle,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      title: 'Add Client',
      description: 'Add new client',
      icon: Users,
      color: 'bg-emerald-600 hover:bg-emerald-700',
    },
    {
      title: 'Templates',
      description: 'Manage templates',
      icon: FileText,
      color: 'bg-indigo-600 hover:bg-indigo-700',
    },
    {
      title: 'Export Data',
      description: 'Download reports',
      icon: Download,
      color: 'bg-purple-600 hover:bg-purple-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, idx) => {
        const Icon = action.icon;
        return (
          <button
            key={idx}
            className={`${action.color} text-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 text-left group`}
          >
            <div className="flex items-center justify-between mb-3">
              <Icon className="w-6 h-6" />
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
