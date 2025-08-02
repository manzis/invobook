// components/RecentActivity.jsx
'use client';

import {
  CheckCircle,
  FileText,
  AlertCircle,
  User,
  DollarSign
} from 'lucide-react';

const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: 'payment',
      message: 'Payment received from Acme Corporation',
      amount: '$2,400.00',
      time: '2 hours ago',
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      id: 2,
      type: 'invoice',
      message: 'Invoice INV-002 sent to TechStart Inc.',
      time: '4 hours ago',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      id: 3,
      type: 'overdue',
      message: 'Invoice INV-003 is now overdue',
      time: '1 day ago',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      id: 4,
      type: 'client',
      message: 'New client "Design Studio" added',
      time: '2 days ago',
      icon: User,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      id: 5,
      type: 'payment',
      message: 'Payment received from Marketing Agency',
      amount: '$2,100.00',
      time: '3 days ago',
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-3 group">
                <div className={`${activity.bgColor} w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 group-hover:text-gray-700 transition-colors">
                    {activity.message}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">{activity.time}</p>
                    {activity.amount && (
                      <span className="text-sm font-medium text-emerald-600">
                        {activity.amount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
          View all activity
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;
