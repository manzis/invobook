'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { Bell, CheckCircle, FileText, AlertCircle, CreditCard, Edit, XCircle, Activity, Check, X } from 'lucide-react';

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

function useOutsideAlerter(ref, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref, callback]);
}

export default function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  useOutsideAlerter(dropdownRef, () => setIsOpen(false));

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const handleView = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    setIsOpen(false);
    if (notification.type.includes('PAYMENT')) {
      router.push('/payments');
    } else if (notification.type.includes('INVOICE') && notification.invoiceId) {
      router.push(`/invoices`);
    }
  };

  return (
    <div ref={dropdownRef} className="relative flex items-center">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="ds-icon-btn relative flex items-center justify-center w-9 h-9 rounded-md hover:bg-[var(--ds-gray-50)] transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-[var(--ds-gray-500)]" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--ds-ship-red)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--ds-ship-red)]"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Overlay to click-outside on mobile */}
          <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setIsOpen(false)} />
          
          <div 
            className="fixed top-0 right-0 bottom-0 w-[100vw] sm:w-96 bg-white z-50 flex flex-col sm:absolute sm:top-full sm:bottom-auto sm:mt-2 sm:right-0 ds-dropdown-content origin-top-right shadow-2xl sm:shadow-[var(--ds-shadow-card-full)]"
            style={{
              overflow: 'hidden'
            }}
          >
          <div className="flex items-center justify-between p-3 border-b border-[var(--ds-gray-100)] bg-[var(--ds-gray-50)]/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-[var(--ds-black)]">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[var(--ds-develop-blue)] text-white text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  className="text-[11px] font-medium text-[var(--ds-gray-500)] hover:text-[var(--ds-black)] transition-colors"
                >
                  Mark all read
                </button>
              )}
              {/* Mobile Close Button */}
              <button 
                onClick={() => setIsOpen(false)}
                className="sm:hidden flex items-center justify-center w-7 h-7 rounded-full bg-white border border-[var(--ds-gray-200)] text-[var(--ds-gray-500)] hover:text-[var(--ds-black)] transition-colors"
                aria-label="Close notifications"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white custom-scrollbar sm:max-h-[500px]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Bell className="w-8 h-8 text-[var(--ds-gray-300)] mb-3" />
                <p className="text-sm text-[var(--ds-gray-500)] font-medium">No notifications yet</p>
                <p className="text-xs text-[var(--ds-gray-400)] mt-1">We'll let you know when something happens.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif) => {
                  const { Icon, className } = getIconForType(notif.type);
                  return (
                    <div 
                      key={notif.id}
                      onClick={() => handleView(notif)}
                      className={`relative flex items-start gap-3 p-3 border-b border-[var(--ds-gray-100)] last:border-0 hover:bg-[var(--ds-gray-50)] transition-colors cursor-pointer ${!notif.isRead ? 'bg-[#FAFBFF]' : ''}`}
                    >
                      {!notif.isRead && (
                        <div className="absolute left-1 top-4 w-1.5 h-1.5 rounded-full bg-[var(--ds-develop-blue)]" />
                      )}
                      
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ml-1 ${className}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0 pr-6">
                        <p className={`text-sm tracking-tight line-clamp-1 ${!notif.isRead ? 'font-semibold text-[var(--ds-black)]' : 'font-medium text-[var(--ds-gray-600)]'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-[var(--ds-gray-500)] mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                        <p className="text-[11px] font-medium text-[var(--ds-gray-400)] mt-1.5">
                          {timeAgo(notif.createdAt)}
                        </p>
                      </div>

                      {notif.isRead ? (
                        <div className="absolute right-3 top-4 text-[var(--ds-gray-300)]" title="Read">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <button
                          onClick={(e) => handleMarkAsRead(notif.id, e)}
                          className="absolute right-3 top-4 w-5 h-5 rounded-full border border-[var(--ds-gray-200)] flex items-center justify-center hover:bg-[var(--ds-develop-blue)] hover:border-[var(--ds-develop-blue)] hover:text-white text-transparent transition-all"
                          title="Mark as read"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="p-3 sm:p-2 border-t border-[var(--ds-gray-100)] bg-[var(--ds-gray-50)]">
            <button 
              onClick={() => setIsOpen(false)}
              className="ds-btn-ghost w-full justify-center h-10 sm:h-8 text-sm sm:text-xs font-medium"
            >
              Close
            </button>
          </div>
        </div>
        </>
      )}
    </div>
  );
}
