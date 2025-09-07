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
  BarChart3,
  CreditCard,
  ChevronLeft, // For toggle button
  ChevronRight, // For toggle button
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const router = useRouter();
  const { pathname } = router;
  
  const { user, logout, loading } = useAuth();
  
  // State for sidebar collapse/expand
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // State for mobile view
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // Set isMobile to true if window width is less than a certain breakpoint (e.g., 768px for md)
      setIsMobile(window.innerWidth < 768);
      // If it's a mobile device, collapse the sidebar automatically
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      } else {
        // Optionally expand it again if not mobile, or keep user preference
        setIsSidebarCollapsed(false); 
      }
    };

    // Set initial state
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

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <aside 
      className={`bg-white border-r border-slate-200 min-h-screen flex flex-col
                 ${isSidebarCollapsed ? 'w-20' : 'w-64'} 
                 transition-all duration-300 ease-in-out`}
    >
      {/* Header */}
      <div className={`p-6 border-b border-slate-200 flex items-center 
                       ${isSidebarCollapsed ? 'justify-center' : 'space-x-2'}`}>
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          {!isSidebarCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">InvoGenerator</h1>
              <p className="text-sm text-gray-500 whitespace-nowrap">Pro Dashboard</p>
            </div>
          )}
        </Link>
      </div>

      {/* Toggle Button */}
      <div className="p-2 flex justify-center">
        <button 
          onClick={toggleSidebar} 
          className="p-2 rounded-full hover:bg-slate-100 transition-colors duration-200"
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-5 h-5 text-slate-500" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-slate-500" />
          )}
        </button>
      </div>

      {/* New Invoice Button */}
      <div className={`p-4 ${isSidebarCollapsed ? 'px-2' : ''}`}>
        <Link 
          href="/new-invoice" 
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 
                     transition-colors duration-200 shadow-sm
                     ${isSidebarCollapsed ? 'p-3 w-auto' : ''}`}
        >
           <FilePlus className={`w-5 h-5 ${isMobile ? 'w-4 h-4' : ''}`} />
          {!isSidebarCollapsed && (
            <span className="font-large text-m whitespace-nowrap">New Invoice</span>
          )}
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
                  <div className={`relative rounded-lg overflow-hidden ${active ? 'bg-blue-50' : 'hover:bg-blue-50'}`}>
                    {active && (
                      <motion.div
                        layoutId="active-indicator"
                        className="absolute left-0 top-0 h-full w-1 bg-blue-600"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    
                    <div className={`relative flex items-center space-x-3 px-4 py-2.5 
                                     ${isSidebarCollapsed ? 'justify-center space-x-0' : ''}`}>
                      <Icon className={`w-5 h-5 ${isMobile ? 'w-4 h-4' : ''}`} />
                      {!isSidebarCollapsed && (
                        <span className="text-m font-large whitespace-nowrap">{item.label}</span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className={`p-4 border-t border-slate-200 ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
        {loading ? (
          <div className={`animate-pulse flex items-center space-x-3 px-3 py-2
                           ${isSidebarCollapsed ? 'flex-col space-x-0 space-y-2' : ''}`}>
            <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
            {!isSidebarCollapsed && (
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                <div className="h-2 bg-slate-200 rounded w-1/2"></div>
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