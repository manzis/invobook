// components/RecentActivity.jsx
'use client';

import {
  CheckCircle,
  FileText,
  AlertCircle,
  User,
  DollarSign,
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
      iconClass: 'text-[#059669]',
    },
    {
      id: 2,
      type: 'invoice',
      message: 'Invoice INV-002 sent to TechStart Inc.',
      time: '4 hours ago',
      icon: FileText,
      iconClass: 'text-[var(--ds-gray-600)]',
    },
    {
      id: 3,
      type: 'overdue',
      message: 'Invoice INV-003 is now overdue',
      time: '1 day ago',
      icon: AlertCircle,
      iconClass: 'text-[var(--ds-ship-red)]',
    },
    {
      id: 4,
      type: 'client',
      message: 'New client "Design Studio" added',
      time: '2 days ago',
      icon: User,
      iconClass: 'text-[var(--ds-gray-600)]',
    },
    {
      id: 5,
      type: 'payment',
      message: 'Payment received from Marketing Agency',
      amount: '$2,100.00',
      time: '3 days ago',
      icon: DollarSign,
      iconClass: 'text-[#059669]',
    },
  ];

  return (
    <div className="ds-card-static p-0 overflow-hidden">
      <div className="px-6 py-4 ds-shadow-ring">
        <h3 className="ds-card-title text-lg">Recent Activity</h3>
      </div>

      <div className="p-6">
        <div className="flex flex-col gap-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-[var(--ds-radius-button)] bg-[var(--ds-gray-50)] flex items-center justify-center shrink-0">
                  <Icon className={`w-4 h-4 ${activity.iconClass}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--ds-black)]">{activity.message}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-[var(--ds-gray-500)]">{activity.time}</p>
                    {activity.amount && (
                      <span className="text-sm font-medium text-[#059669]">
                        {activity.amount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className="ds-link w-full mt-4 text-center border-0 bg-transparent cursor-pointer"
        >
          View all activity
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;
