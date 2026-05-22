'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import UserMenu from '../ui/UserMenu';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  FilePlus,
  BarChart3,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const router = useRouter();
  const { pathname } = router;
  const { user, logout, loading } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setIsSidebarCollapsed(true);
      else setIsSidebarCollapsed(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { id: 'invoices', label: 'Invoices', href: '/invoices', icon: FileText },
    { id: 'clients', label: 'Clients', href: '/clients', icon: Users },
    { id: 'analytics', label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { id: 'payments', label: 'Payments', href: '/payments', icon: CreditCard },
    { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href) => {
    if (!pathname) return false;
    return href === '/' ? pathname === href : pathname.startsWith(href);
  };

  return (
    <aside
      className={`ds-sidebar ${isSidebarCollapsed ? 'w-[72px]' : 'w-64'}`}
    >
      <div
        className={`p-6 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}
        style={{ boxShadow: 'var(--ds-shadow-ring)' }}
      >
        <Link href="/dashboard" className="flex items-center gap-3 no-underline">
          <div
            className="w-8 h-8 flex items-center justify-center flex-shrink-0"
            style={{
              background: 'var(--ds-black)',
              borderRadius: 'var(--ds-radius-button)',
            }}
          >
            <FileText className="w-4 h-4" style={{ color: 'var(--ds-white)' }} />
          </div>
          {!isSidebarCollapsed && (
            <div>
              <p
                className="text-sm font-semibold m-0 whitespace-nowrap"
                style={{ color: 'var(--ds-black)', letterSpacing: '-0.28px' }}
              >
                Invobook
              </p>
              <p className="ds-mono-label m-0 mt-1" style={{ fontSize: '10px' }}>
                Invoices
              </p>
            </div>
          )}
        </Link>
      </div>

      <div className="p-2 flex justify-center">
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="ds-icon-btn"
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className={`p-4 ${isSidebarCollapsed ? 'px-2' : ''}`}>
        <Link
          href="/new-invoice"
          className={`ds-btn-dark w-full justify-center no-underline ${isSidebarCollapsed ? 'px-3' : ''}`}
        >
          <FilePlus className="w-4 h-4" />
          {!isSidebarCollapsed && <span>New Invoice</span>}
        </Link>
      </div>

      <nav className="flex-1 px-3 pb-4 mt-2">
        <ul className="space-y-1 list-none m-0 p-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`ds-sidebar-nav-item ${active ? 'ds-sidebar-nav-item-active' : ''} ${
                    isSidebarCollapsed ? 'justify-center px-2' : ''
                  }`}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        className={`p-4 ${isSidebarCollapsed ? 'flex justify-center' : ''}`}
        style={{ boxShadow: 'var(--ds-shadow-ring)' }}
      >
        {loading ? (
          <div className="animate-pulse flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full" style={{ background: 'var(--ds-gray-100)' }} />
            {!isSidebarCollapsed && (
              <div className="flex-1 space-y-2">
                <div className="h-3 rounded w-3/4" style={{ background: 'var(--ds-gray-100)' }} />
                <div className="h-2 rounded w-1/2" style={{ background: 'var(--ds-gray-100)' }} />
              </div>
            )}
          </div>
        ) : (
          user && <UserMenu user={user} isCollapsed={isSidebarCollapsed} onLogout={logout} />
        )}
      </div>
    </aside>
  );
}
