// /components/Sidebar/sidebar.jsx

'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import UserMenu from '../ui/UserMenu';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  FilePlus,
  Plus,
  BarChart3,
  CreditCard,
} from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const { pathname } = router;
  
  const { user, logout, loading } = useAuth();

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
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">InvoiceFlow</h1>
            <p className="text-sm text-gray-500">Pro Dashboard</p>
          </div>
        </Link>
      </div>

      {/* New Invoice Button */}
      <div className="p-4">
        <Link 
          href="/new-invoice" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 
                     transition-colors duration-200 shadow-sm"
        >
           <FilePlus className="w-5 h-5" />
          <span className="font-large text-m">New Invoice</span>
        </Link>
      </div>

      {/* --- REDESIGNED Main Navigation --- */}
      <nav className="flex-1 px-4 pb-4 mt-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`
                    w-full block rounded-lg transition-colors duration-200
                    ${active
                      ? 'text-blue-600 font-semibold'
                      : 'text-slate-500 hover:text-slate-900'
                    }
                  `}
                >
                  {/* 
                    **THE FIX IS HERE**: This new wrapper div contains both the pill and the content.
                    It has the background color, relative positioning, and overflow-hidden.
                  */}
                  <div className={`relative rounded-lg overflow-hidden ${active ? 'bg-blue-50' : 'hover:bg-blue-50'}`}>
                    {/* The animated blue border indicator */}
                    {active && (
                      <motion.div
                        layoutId="active-indicator"
                        className="absolute left-0 top-0 h-full w-1 bg-blue-600"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    
                    {/* The content now has the padding, ensuring it sits correctly */}
                    <div className="relative flex items-center space-x-3 px-4 py-2.5">
                      <Icon className="w-5 h-5" />
                      <span className="text-m font-large">{item.label}</span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200">
        {loading ? (
          <div className="animate-pulse flex items-center space-x-3 px-3 py-2">
            <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
            <div className="flex-1 space-y-2"><div className="h-3 bg-slate-200 rounded w-3/4"></div><div className="h-2 bg-slate-200 rounded w-1/2"></div></div>
          </div>
        ) : (
          user && <UserMenu user={user} onLogout={logout} />
        )}
      </div>
    </aside>
  );
}