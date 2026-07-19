import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import UserMenu from '../ui/UserMenu';
import {
  LayoutDashboard,
  FileText,
  Users,
  Building,
  Settings,
  FilePlus,
  BarChart3,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Search,
  Sparkles,
  Package
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useInventory } from '../../context/InventoryContext';

export default function Sidebar() {
  const router = useRouter();
  const { pathname } = router;
  const { user, logout, loading } = useAuth();
  const { inventoryEnabled } = useInventory();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setIsSidebarCollapsed(true);
      else setIsSidebarCollapsed(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcut listener to focus "Find..." input when pressing 'f'
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Focus if 'f' is pressed, but not when user is typing in form controls or layout input
      if (
        (e.key === 'f' || e.key === 'F') &&
        document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA' &&
        !document.activeElement.isContentEditable &&
        !isSidebarCollapsed
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarCollapsed]);


  // Fetch payments to count pending ones
  useEffect(() => {
    if (!user || loading) return;
    
    const fetchPendingCount = async () => {
      try {
        const res = await fetch('/api/payments');
        if (res.ok) {
          const payments = await res.json();
          if (Array.isArray(payments)) {
            const count = payments.filter(p => p.status === 'pending').length;
            setPendingCount(count);
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

  // Menu items grouped logically
  const primarySection = [
    { id: 'dashboard', label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { id: 'quotations', label: 'Quotations', href: '/quotations', icon: FileText },
    { id: 'invoices', label: 'Invoices', href: '/invoices', icon: FileText },
    { id: 'clients', label: 'Clients', href: '/clients', icon: Users },
    { id: 'vendors', label: 'Vendors', href: '/vendors', icon: Building },
    ...(inventoryEnabled ? [{ id: 'inventory', label: 'Inventory', href: '/inventory', icon: Package }] : []),
  ];

  const insightSection = [
    { id: 'analytics', label: 'Analytics', href: '/analytics', icon: BarChart3, hasChevron: true },
    { id: 'payments', label: 'Payments', href: '/payments', icon: CreditCard, badge: pendingCount > 0 ? pendingCount : null },
  ];

  const accountSection = [
    { id: 'settings', label: 'Settings', href: '/settings', icon: Settings, hasChevron: true },
  ];

  const isActive = (href) => {
    if (!pathname) return false;
    return href === '/' ? pathname === href : pathname.startsWith(href);
  };

  const getFirstName = () => {
    if (!user || !user.name) return 'guest';
    return user.name.split(' ')[0].toLowerCase();
  };

  const filterItems = (items) => {
    return items.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const renderNavList = (items) => {
    const filtered = filterItems(items);
    if (filtered.length === 0) return null;

    return (
      <ul className="space-y-[2px] list-none m-0 p-0">
        {filtered.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`ds-sidebar-nav-item select-none ${active ? 'ds-sidebar-nav-item-active' : ''} ${item.id === 'buy-plan' ? 'ds-sidebar-nav-item-buy' : ''
                  } ${isSidebarCollapsed ? 'justify-center mx-auto' : 'justify-between px-3 '
                  }`}
                title={isSidebarCollapsed ? item.label : undefined}
                style={{
                  height: '32px',
                  width: isSidebarCollapsed ? '34px' : 'auto',
                  padding: isSidebarCollapsed ? '0' : undefined,
                }}
              >
                <div className="flex items-center justify-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!isSidebarCollapsed && item.badge && (
                  <span className="flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-[var(--ds-ship-red)] text-white text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
                {!isSidebarCollapsed && item.hasChevron && !item.badge && (
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--ds-gray-400)] flex-shrink-0" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <aside
      className={`ds-sidebar relative select-none ${isSidebarCollapsed ? 'w-[72px]' : 'w-56'}`}
      style={{
        borderRight: '1px solid var(--ds-gray-100)',
        boxShadow: 'none',
      }}
    >
      {/* Brand Scope Switcher (Top Header) */}
      <div
        className={`h-14 flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-4'}`}
        style={{ borderBottom: '1px solid var(--ds-gray-100)' }}
      >
        <div className={`flex items-center min-w-0 ${isSidebarCollapsed ? 'justify-center w-full' : 'gap-2.5 w-full'}`}>
          {/* Vercel scope green team indicator */}
          <div
            className="w-6 h-6 rounded-full flex-shrink-0 bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            }}
          >
            <span>I</span>
          </div>
          {!isSidebarCollapsed && (
            <div className="flex items-center justify-between flex-1 min-w-0 gap-1.5">
              <span className="text-sm font-semibold truncate text-[var(--ds-black)] tracking-tight">
                {getFirstName()}&apos;s projects
              </span>
              <span className="text-[10px] font-semibold text-[var(--ds-gray-500)] px-1.5 py-0.5 rounded-md border border-[var(--ds-gray-100)] bg-[var(--ds-gray-50)] flex-shrink-0 uppercase tracking-tight">
                Hobby
              </span>
              <ChevronsUpDown className="w-3.5 h-3.5 text-[var(--ds-gray-400)] flex-shrink-0" />
            </div>
          )}
        </div>
      </div>

      {/* Absolute positioned collapse button sitting exactly on the border intersection */}
      <button
        type="button"
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className="hidden sm:flex absolute top-[72px] right-0 translate-x-1/2 -translate-y-1/2 z-30 items-center justify-center w-6 h-6 rounded-full bg-white text-[var(--ds-gray-500)] hover:text-[var(--ds-black)] transition-all cursor-pointer"
        style={{
          boxShadow: '0px 2px 4px rgba(0,0,0,0.06), 0px 0px 0px 1px var(--ds-gray-100)',
          border: 'none',
        }}
        aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isSidebarCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Sidebar Search Bar (Find...) */}
      {!isSidebarCollapsed && (
        <div className="px-3 pt-3 pb-1">
          <div className="relative flex items-center w-full">
            <Search className="absolute left-2.5 w-3.5 h-3.5 text-[var(--ds-gray-400)] pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Find..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ds-input pl-8 pr-7 py-1 text-xs w-full h-8"
              style={{
                borderRadius: '6px',
                background: 'transparent',
                boxShadow: 'var(--ds-shadow-ring-light)',
              }}
            />
            <span
              className="absolute right-2 px-1.5 py-0.5 rounded border border-[var(--ds-gray-100)] bg-[var(--ds-gray-50)] text-[10px] font-mono text-[var(--ds-gray-400)] pointer-events-none uppercase"
            >
              F
            </span>
          </div>
        </div>
      )}

      {/* New Invoice CTA (Compact Vercel style - top-aligned) */}
      <div className={`p-3 py-1.5 ${isSidebarCollapsed ? 'px-2 flex justify-center' : ''}`}>
        <Link
          href="/new-invoice"
          className={`ds-btn-dark gap-1.5 text-xs justify-center no-underline ${isSidebarCollapsed ? 'w-[34px] h-[34px] p-0 rounded-lg flex items-center justify-center' : 'w-full h-[34px] px-4'
            }`}
          title={isSidebarCollapsed ? 'New Invoice' : undefined}
        >
          <FilePlus className="w-3.5 h-3.5" />
          {!isSidebarCollapsed && <span>New Invoice</span>}
        </Link>
      </div>

      {/* Navigation Stack */}
      <nav className="flex-1 px-3 mt-1 overflow-y-auto space-y-3.5 scrollbar-thin">
        {/* Section 1: Overview & Invoicing */}
        <div>
          {renderNavList(primarySection)}
        </div>

        {/* Divider 1 */}
        {!isSidebarCollapsed && filterItems(primarySection).length > 0 && filterItems(insightSection).length > 0 && (
          <div className="border-t border-[var(--ds-gray-100)] " />
        )}

        {/* Section 2: Analytics & Insights */}
        <div>
          {renderNavList(insightSection)}
        </div>

        {/* Divider 2 */}
        {!isSidebarCollapsed && filterItems(insightSection).length > 0 && filterItems(accountSection).length > 0 && (
          <div className="border-t border-[var(--ds-gray-100)] " />
        )}

        {/* Section 3: Account Config */}
        <div>
          {renderNavList(accountSection)}
        </div>
      </nav>

      {/* Current Plan Card / Buy a Plan CTA */}
      <div className={`p-3 pb-4 ${isSidebarCollapsed ? 'px-2 flex justify-center' : 'mt-2'}`}>
        {isSidebarCollapsed ? (
          <Link
            href="/billing"
            className="w-[34px] h-[34px] bg-[#0a0a0a] text-white rounded-lg flex items-center justify-center hover:bg-[#1a1a1a] transition-colors border border-[#222]"
            title="Buy a Plan"
          >
            <Sparkles className="w-4 h-4" />
          </Link>
        ) : (
          <div className="rounded-xl bg-[#0a0a0a] border border-[#222] p-3.5 relative overflow-hidden shadow-lg group">
            {/* Dotted Background Pattern */}
            <div
              className="absolute inset-0 opacity-[0.08] pointer-events-none transition-opacity group-hover:opacity-[0.12]"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '12px 12px'
              }}
            />
            {/* Subtle Gradient Glow */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-emerald-600 opacity-20 blur-2xl rounded-full pointer-events-none transition-opacity group-hover:opacity-30" />

            <div className="relative z-10 flex flex-col gap-2.5">
              <div>
                <p className="text-[10px] font-semibold text-[#888] uppercase tracking-wider mb-0.5">Current Plan</p>
                <p className="text-[13px] font-medium text-white flex items-center gap-1.5">
                  Starter
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-bold text-white border border-white/10 uppercase tracking-widest">
                    Free
                  </span>
                </p>
              </div>

              <Link
                href="/billing"
                className="w-full bg-white text-black hover:bg-gray-200 transition-colors py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" /> Buy a Plan
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Account Footer block */}
      <div
        className={`p-3 ${isSidebarCollapsed ? 'flex justify-center px-0' : ''}`}
        style={{ borderTop: '1px solid var(--ds-gray-100)' }}
      >
        {loading ? (
          <div className="animate-pulse flex items-center gap-3 px-3 py-2">
            <div className="w-6 h-6 rounded-full" style={{ background: 'var(--ds-gray-100)' }} />
            {!isSidebarCollapsed && (
              <div className="flex-1 space-y-1.5">
                <div className="h-3 rounded w-3/4" style={{ background: 'var(--ds-gray-100)' }} />
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
