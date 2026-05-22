// components/RecentActivity.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  CheckCircle,
  FileText,
  AlertCircle,
  CreditCard,
  Edit,
  XCircle,
  Activity,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

// Formatter for relative time
function timeAgo(dateParam) {
  if (!dateParam) return '';
  const date = typeof dateParam === 'object' ? dateParam : new Date(dateParam);
  const today = new Date();
  const seconds = Math.round((today - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return 'Just now';
  else if (minutes < 60) return `${minutes} min ago`;
  else if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  else if (days === 1) return 'Yesterday';
  else return `${days} days ago`;
}

// Map notification type to icon and styling
const getIconForType = (type) => {
  switch (type) {
    case 'INVOICE_CREATE':
      return { Icon: FileText, className: 'text-[var(--ds-gray-600)] bg-[var(--ds-gray-50)]' };
    case 'INVOICE_EDIT':
      return { Icon: Edit, className: 'text-[var(--ds-develop-blue)] bg-[#EBF5FF]' };
    case 'PAYMENT_ATTEMPT':
      return { Icon: CreditCard, className: 'text-amber-600 bg-amber-50' };
    case 'PAYMENT_VERIFIED':
      return { Icon: CheckCircle, className: 'text-[#059669] bg-[#E1F3ED]' };
    case 'PAYMENT_REJECTED':
      return { Icon: XCircle, className: 'text-[var(--ds-ship-red)] bg-[#FEE2E2]' };
    case 'INVOICE_OVERDUE':
      return { Icon: AlertCircle, className: 'text-[var(--ds-ship-red)] bg-[#FEE2E2]' };
    default:
      return { Icon: Activity, className: 'text-[var(--ds-gray-500)] bg-[var(--ds-gray-50)]' };
  }
};

const RecentActivity = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          // Filter out older stuff if we want, but taking top 5 for dashboard
          setActivities(data.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const handleViewActivity = (activity) => {
    if (activity.type.includes('PAYMENT')) {
      router.push('/payments');
    } else if (activity.type.includes('INVOICE') && activity.invoiceId) {
      router.push(`/invoices`);
    }
  };

  return (
    <div className="ds-card-static p-0 overflow-hidden">
      <div className="px-6 py-4 ds-shadow-ring">
        <h3 className="ds-card-title text-lg">Recent Activity</h3>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex flex-col gap-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-md bg-[var(--ds-gray-100)]" />
                <div className="flex-1">
                  <div className="h-4 bg-[var(--ds-gray-100)] rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[var(--ds-gray-100)] rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="flex flex-col gap-4">
            {activities.map((activity) => {
              const { Icon, className } = getIconForType(activity.type);
              return (
                <div 
                  key={activity.id} 
                  className="flex items-start gap-3 cursor-pointer p-2 -mx-2 rounded-md hover:bg-[var(--ds-gray-50)] transition-colors group"
                  onClick={() => handleViewActivity(activity)}
                >
                  <div className={`w-8 h-8 rounded-[var(--ds-radius-button)] flex items-center justify-center shrink-0 ${className}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--ds-black)] font-medium group-hover:text-blue-600 transition-colors">
                      {activity.title}
                    </p>
                    <p className="text-[13px] text-[var(--ds-gray-600)] mt-0.5 line-clamp-1 leading-relaxed">
                      {activity.message}
                    </p>
                    <p className="text-xs text-[var(--ds-gray-400)] mt-1 font-medium tracking-tight">
                      {timeAgo(activity.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-[var(--ds-gray-500)]">
            No recent activity to show.
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            // Future implementation: Full activity page
            toast('Full activity logs coming soon!');
          }}
          className="ds-link w-full mt-4 text-center border-0 bg-transparent cursor-pointer font-semibold"
        >
          View all activity
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;
