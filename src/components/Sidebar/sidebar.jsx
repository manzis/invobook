// /components/Sidebar/sidebar.jsx (Corrected and Final)

'use client'; // This directive is fine to keep

import Link from 'next/link';
// --- 1. THE FIX: Import from 'next/router' NOT 'next/navigation' ---
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import UserMenu from '../ui/UserMenu';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  PlusCircle,
  BarChart3,
  CreditCard,
} from 'lucide-react';

export default function Sidebar() {
  // --- 2. THE FIX: Get the router object and destructure the pathname ---
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

  // --- 3. THE FIX: Add a "guard clause" to prevent errors on the very first render ---
  const isActive = (href) => {
    // If the pathname isn't available yet, safely return false.
    if (!pathname) {
      return false;
    }
    // Your existing logic is correct.
    return href === '/' ? pathname === href : pathname.startsWith(href);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo + Header (no changes needed) */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">InvoiceFlow</h1>
            <p className="text-sm text-gray-500">Pro Dashboard</p>
          </div>
        </div>
      </div>

      {/* New Invoice Button (no changes needed) */}
      <div className="p-4">
        <Link href="/new-invoice" className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200 shadow-sm">
          <PlusCircle className="w-5 h-5" />
          <span className="font-medium">New Invoice</span>
        </Link>
      </div>

      {/* Main Navigation (no changes needed) */}
      <nav className="flex-1 px-4 pb-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile (no changes needed) */}
      <div className="p-4 border-t border-gray-200">
        {loading ? (
          <div className="flex items-center space-x-3 px-3 py-2 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ) : (
          user && <UserMenu user={user} onLogout={logout} />
        )}
      </div>
    </div>
  );
}