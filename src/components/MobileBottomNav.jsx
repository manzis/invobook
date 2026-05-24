'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  MoreHorizontal,
  Users,
  Package,
  CreditCard,
  FilePlus,
  UserPlus,
  X,
  Palette,
  Bell,
  LogOut,
  Zap
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';

export default function MobileBottomNav() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { inventoryEnabled } = useInventory();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Poll for pending payments count (same as sidebar)
  useEffect(() => {
    if (!user || loading) return;
    const fetchPendingCount = async () => {
      try {
        const res = await fetch('/api/payments');
        if (res.ok) {
          const payments = await res.json();
          if (Array.isArray(payments)) {
            setPendingCount(payments.filter(p => p.status === 'pending').length);
          }
        }
      } catch (err) {
        console.error('Failed to fetch pending payments count:', err);
      }
    };
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 10000);
    return () => clearInterval(interval);
  }, [user, loading]);

  // Prevent background scrolling when 'More' menu is open
  useEffect(() => {
    if (isMoreOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMoreOpen]);

  // Close the menu if route changes
  useEffect(() => {
    setIsMoreOpen(false);
  }, [router.pathname]);

  const isActive = (href) => router.pathname.startsWith(href);

  const mainTabs = [
    { id: 'dashboard', label: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { id: 'invoices', label: 'Invoices', href: '/invoices', icon: FileText },
    { id: 'analytics', label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
  ];

  const secondaryTabs = [
    { id: 'clients', label: 'Clients', href: '/clients', icon: Users },
    ...(inventoryEnabled ? [{ id: 'inventory', label: 'Inventory', href: '/inventory', icon: Package }] : []),
    { id: 'payments', label: 'Payments', href: '/payments', icon: CreditCard, badge: pendingCount > 0 ? pendingCount : null },
    { id: 'upgrade', label: 'Upgrade to Pro', href: '/upgrade', icon: Zap },
    { id: 'logout', label: 'Log Out', action: logout, icon: LogOut },
  ];

  const shortcutTabs = [
    { id: 'new-invoice', label: 'New Invoice', href: '/new-invoice', icon: FilePlus },
    { id: 'add-client', label: 'Add Client', href: '/clients?action=add', icon: UserPlus },
    { id: 'templates', label: 'Templates', href: '/settings?tab=templates', icon: Palette },
    { id: 'notifications', label: 'Notifications', href: '/settings?tab=notifications', icon: Bell },
  ];

  return (
    <>
      {/* Overlay Backdrop for 'More' Menu */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[55] md:hidden transition-opacity duration-300 ${
          isMoreOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMoreOpen(false)}
      />

      {/* 'More' Menu Slide-up Sheet */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[60] md:hidden transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isMoreOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.08)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 64px)' // Space for the bottom nav
        }}
      >
        <div className="flex flex-col p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold tracking-tight text-[var(--ds-black)]">More Options</h2>
            <button 
              onClick={() => setIsMoreOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--ds-gray-100)] text-[var(--ds-gray-600)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-[10px] font-semibold text-[var(--ds-gray-400)] uppercase tracking-wider mb-3 px-1">Shortcuts</h3>
              <div className="grid grid-cols-2 gap-2">
                {shortcutTabs.map(tab => {
                  const Icon = tab.icon;
                  const active = isActive(tab.href);
                  return (
                    <Link 
                      key={tab.id} 
                      href={tab.href}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border ${
                        active
                          ? 'bg-[var(--ds-gray-50)]'
                          : 'border-transparent bg-[var(--ds-gray-50)] hover:bg-[var(--ds-gray-100)]'
                      } active:bg-[var(--ds-gray-100)] transition-colors`}
                      style={active ? { borderColor: 'var(--ds-gray-100)' } : undefined}
                    >
                      <Icon className={`w-6 h-6 mb-2 ${active ? 'text-[var(--ds-black)]' : 'text-[var(--ds-gray-600)]'}`} />
                      <span className={`text-xs font-semibold tracking-tight ${active ? 'text-[var(--ds-black)]' : 'text-[var(--ds-gray-600)]'}`}>
                        {tab.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-semibold text-[var(--ds-gray-400)] uppercase tracking-wider mb-3 px-1">Navigation</h3>
              <div className="grid grid-cols-2 gap-2">
                {secondaryTabs.map(tab => {
                  const Icon = tab.icon;
                  
                  if (tab.action) {
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setIsMoreOpen(false);
                          tab.action();
                        }}
                        className="flex items-center p-3 rounded-xl border border-transparent bg-[var(--ds-gray-50)] hover:bg-[var(--ds-gray-100)] transition-colors w-full text-left"
                      >
                        <div className="relative">
                          <Icon className="w-5 h-5 mr-3 text-[var(--ds-gray-500)]" />
                        </div>
                        <span className="text-sm font-medium text-[var(--ds-gray-600)]">
                          {tab.label}
                        </span>
                      </button>
                    );
                  }

                  const active = isActive(tab.href);
                  return (
                    <Link 
                      key={tab.id} 
                      href={tab.href}
                      className={`flex items-center p-3 rounded-xl border ${
                        active 
                          ? 'bg-[var(--ds-gray-50)]' 
                          : 'border-transparent bg-[var(--ds-gray-50)] hover:bg-[var(--ds-gray-100)]'
                      } transition-colors`}
                      style={active ? { borderColor: 'var(--ds-gray-100)' } : undefined}
                    >
                      <div className="relative">
                        <Icon className={`w-5 h-5 mr-3 ${active ? 'text-[var(--ds-black)]' : 'text-[var(--ds-gray-500)]'}`} />
                        {tab.badge && (
                          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-[var(--ds-ship-red)] text-white text-[9px] font-bold border-2 border-white">
                            {tab.badge}
                          </span>
                        )}
                      </div>
                      <span className={`text-sm font-medium ${active ? 'text-[var(--ds-black)]' : 'text-[var(--ds-gray-600)]'}`}>
                        {tab.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Fixed Bottom Navigation Bar */}
      <nav 
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md md:hidden z-[65] select-none"
        style={{
          boxShadow: '0 -1px 0 0 var(--ds-gray-100)',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        <div className="flex justify-around items-end h-16 px-2">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className="relative flex flex-col items-center justify-center flex-1 h-full pt-1 pb-1"
                onClick={() => setIsMoreOpen(false)}
              >
                {/* Active Top Pill Indicator */}
                <div 
                  className={`absolute top-0 left-1/2 -translate-x-1/2 h-[3px] rounded-b-full transition-all duration-300 ${
                    active ? 'w-8 bg-[var(--ds-black)]' : 'w-0 bg-transparent'
                  }`}
                />
                <Icon className={`w-[22px] h-[22px] mb-1 transition-colors duration-200 ${
                  active ? 'text-[var(--ds-black)]' : 'text-[var(--ds-gray-400)]'
                }`} />
                <span className={`text-[10px] font-medium transition-colors duration-200 ${
                  active ? 'text-[var(--ds-black)]' : 'text-[var(--ds-gray-500)]'
                }`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}

          {/* 'More' Button */}
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className="relative flex flex-col items-center justify-center flex-1 h-full pt-1 pb-1"
          >
            {/* Active Pill for 'More' menu itself */}
            <div 
              className={`absolute top-0 left-1/2 -translate-x-1/2 h-[3px] rounded-b-full transition-all duration-300 ${
                isMoreOpen ? 'w-8 bg-[var(--ds-black)]' : 'w-0 bg-transparent'
              }`}
            />
            <div className="relative">
              <MoreHorizontal className={`w-[22px] h-[22px] mb-1 transition-colors duration-200 ${
                isMoreOpen ? 'text-[var(--ds-black)]' : 'text-[var(--ds-gray-400)]'
              }`} />
              {/* Badge indicator on 'More' if any hidden items have badges */}
              {!isMoreOpen && pendingCount > 0 && (
                <div className="absolute top-0 -right-1 w-2.5 h-2.5 bg-[var(--ds-ship-red)] rounded-full border-[1.5px] border-white" />
              )}
            </div>
            <span className={`text-[10px] font-medium transition-colors duration-200 ${
              isMoreOpen ? 'text-[var(--ds-black)]' : 'text-[var(--ds-gray-500)]'
            }`}>
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
