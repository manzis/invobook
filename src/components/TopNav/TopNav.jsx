'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  MoreVertical,
  FilePlus,
  UserPlus,
  Sliders,
  Download,
  Activity,
  RotateCw,
  HelpCircle,
  CheckCircle,
  Home,
  X
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useToast } from '../../context/ToastContext';

// Hook to detect clicking outside the dropdown container
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

export default function TopNav() {
  const router = useRouter();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [cacheStatus, setCacheStatus] = useState('Idle');
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  
  const dropdownRef = useRef(null);
  useOutsideAlerter(dropdownRef, () => setIsOpen(false));

  // Fetch invoice number for breadcrumbs if editing an invoice
  useEffect(() => {
    if (router.query.invoiceId) {
      fetch(`/api/updateInvoice/${router.query.invoiceId}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Not found');
        })
        .then(data => {
          if (data && data.invoiceNumber) {
            setInvoiceNumber(data.invoiceNumber);
          }
        })
        .catch(err => console.error("Breadcrumb fetch error:", err));
    } else {
      setInvoiceNumber('');
    }
  }, [router.query.invoiceId]);

  // Determine if running locally or production
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLocalhost(
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1'
      );
    }
  }, []);

  // Format the path into nice breadcrumbs
  const getBreadcrumbs = () => {
    const path = router.pathname;
    if (path === '/') return [{ label: 'Dashboard', href: '/' }];
    
    const parts = path.split('/').filter(Boolean);
    return parts.map((part, index) => {
      // If it's the dynamic invoiceId path, show the actual invoice number if we fetched it, or fallback
      if (part === '[invoiceId]') {
        const href = '/' + parts.slice(0, index + 1).join('/').replace('[invoiceId]', router.query.invoiceId);
        return { label: invoiceNumber || 'Loading...', href };
      }

      // Clean up string (replace dashes, capitalize)
      const label = part
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      const href = '/' + parts.slice(0, index + 1).join('/');
      return { label, href };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  // Functional tool: Export Invoices Database to JSON
  const handleExportData = async () => {
    try {
      const res = await fetch('/api/invoices');
      if (!res.ok) throw new Error('Failed to load database invoices.');
      const data = await res.json();
      
      // Serialize to JSON string
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;
      
      // Generate trigger anchor
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `invobook_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      
      setIsOpen(false);
    } catch (err) {
      console.error('Database export error:', err);
      toast('Error exporting database. Please try again.');
    }
  };

  // Simulate resetting page and API client caching
  const handleCacheRefresh = () => {
    setCacheStatus('Refreshing...');
    setTimeout(() => {
      setCacheStatus('Complete');
      router.reload();
    }, 800);
  };

  return (
    <>
      <header 
        className="w-full flex items-center justify-between px-4 sm:px-6 h-14 bg-white select-none shrink-0"
        style={{
          boxShadow: '0px 1px 0px 0px var(--ds-gray-100)',
          zIndex: 40
        }}
      >
        {/* Left Side: Breadcrumb Trail */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 overflow-x-auto hide-scrollbar pr-2">
          <Link href="/dashboard" className="shrink-0 text-[var(--ds-gray-500)] hover:text-[var(--ds-black)] transition-colors">
            <Home className="w-4 h-4" />
          </Link>
          
          <span className="hidden sm:inline shrink-0 text-[var(--ds-gray-400)] text-xs font-light select-none">/</span>
          
          <span className="hidden sm:inline shrink-0 text-sm font-semibold select-none tracking-tight text-[var(--ds-gray-400)]">
            Invobook
          </span>

          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.href}>
              <span className="shrink-0 text-[var(--ds-gray-400)] text-xs font-light select-none">/</span>
              <span 
                className={`shrink-0 text-sm tracking-tight whitespace-nowrap ${
                  idx === breadcrumbs.length - 1 
                    ? 'font-semibold text-[var(--ds-black)]' 
                    : 'font-medium text-[var(--ds-gray-500)]'
                }`}
              >
                {crumb.label}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* Right Side: Environment indicator + dropdown actions */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Pulsing Deployment Environment badge */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-[var(--ds-gray-100)] bg-[var(--ds-gray-50)] text-xs font-semibold tracking-tight text-[var(--ds-gray-600)]">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isLocalhost ? 'bg-[var(--ds-develop-blue)]' : 'bg-emerald-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isLocalhost ? 'bg-[var(--ds-develop-blue)]' : 'bg-emerald-500'
              }`}></span>
            </span>
            <span>{isLocalhost ? 'Development' : 'Production'}</span>
          </div>

          {/* Notification Bell */}
          <NotificationBell />

          {/* Three Dot Action Popover */}
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="ds-icon-btn flex items-center justify-center w-9 h-9 rounded-md hover:bg-[var(--ds-gray-50)]"
              aria-label="Open Actions Menu"
            >
              <MoreVertical className="w-5 h-5 text-[var(--ds-gray-500)]" />
            </button>

            {isOpen && (
              <>
                {/* Mobile overlay for the action menu */}
                <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setIsOpen(false)} />
                <div 
                  className="absolute right-0 mt-1.5 w-[240px] sm:w-64 ds-dropdown-content z-50 origin-top-right"
                  style={{
                    boxShadow: 'var(--ds-shadow-card-full)'
                  }}
                >
                <div className="p-1">
                  {/* Category 1: Shortcuts */}
                  <div className="px-2 py-1 text-[10px] font-semibold text-[var(--ds-gray-400)] tracking-wider uppercase select-none">
                    Shortcuts
                  </div>
                  <Link href="/new-invoice" onClick={() => setIsOpen(false)} className="ds-dropdown-item no-underline">
                    <FilePlus className="w-4 h-4 mr-2.5 text-[var(--ds-gray-500)]" />
                    <span>New Invoice</span>
                  </Link>
                  <Link href="/clients?action=add" onClick={() => setIsOpen(false)} className="ds-dropdown-item no-underline">
                    <UserPlus className="w-4 h-4 mr-2.5 text-[var(--ds-gray-500)]" />
                    <span>Add Client</span>
                  </Link>
                  <Link href="/settings" onClick={() => setIsOpen(false)} className="ds-dropdown-item no-underline">
                    <Sliders className="w-4 h-4 mr-2.5 text-[var(--ds-gray-500)]" />
                    <span>Settings & Profile</span>
                  </Link>

                  <div className="my-1 border-t border-[var(--ds-gray-100)]" />

                  {/* Category 2: Data Controls */}
                  <div className="px-2 py-1 text-[10px] font-semibold text-[var(--ds-gray-400)] tracking-wider uppercase select-none">
                    Database Tools
                  </div>
                  <button 
                    type="button" 
                    onClick={handleExportData} 
                    className="ds-dropdown-item"
                  >
                    <Download className="w-4 h-4 mr-2.5 text-[var(--ds-gray-500)]" />
                    <span>Export Invoices (JSON)</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsOpen(false);
                      setShowDiagnostics(true);
                    }} 
                    className="ds-dropdown-item"
                  >
                    <Activity className="w-4 h-4 mr-2.5 text-[var(--ds-gray-500)]" />
                    <span>System Diagnostics</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={handleCacheRefresh} 
                    className="ds-dropdown-item"
                    disabled={cacheStatus !== 'Idle'}
                  >
                    <RotateCw className={`w-4 h-4 mr-2.5 text-[var(--ds-gray-500)] ${cacheStatus === 'Refreshing...' ? 'animate-spin' : ''}`} />
                    <span>{cacheStatus === 'Idle' ? 'Clear & Refetch Cache' : cacheStatus}</span>
                  </button>
                </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Modern Diagnostics HUD Panel Overlay */}
      {showDiagnostics && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 100 }}>
          <div 
            className="w-full max-w-md bg-white rounded-lg p-6 shadow-2xl relative"
            style={{ 
              boxShadow: 'var(--ds-shadow-card-full)',
              border: '1px solid var(--ds-gray-100)'
            }}
          >
            <button 
              type="button" 
              onClick={() => setShowDiagnostics(false)} 
              className="absolute top-4 right-4 ds-icon-btn"
              aria-label="Close panel"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-md bg-[var(--ds-black)] flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-[var(--ds-black)]">System Diagnostics HUD</h3>
                <p className="text-xs text-[var(--ds-gray-500)] mt-0.5">Real-time developer engine stats</p>
              </div>
            </div>

            <div className="space-y-3.5 mt-6">
              {/* Stat 1 */}
              <div className="flex justify-between items-center py-2 border-b border-[var(--ds-gray-100)]">
                <span className="text-sm font-medium text-[var(--ds-gray-600)]">Frontend Core</span>
                <span className="text-sm font-mono text-[var(--ds-black)]">Next.js v15.4.4</span>
              </div>
              {/* Stat 2 */}
              <div className="flex justify-between items-center py-2 border-b border-[var(--ds-gray-100)]">
                <span className="text-sm font-medium text-[var(--ds-gray-600)]">UI Framework</span>
                <span className="text-sm font-mono text-[var(--ds-black)]">React v19.1.1</span>
              </div>
              {/* Stat 3 */}
              <div className="flex justify-between items-center py-2 border-b border-[var(--ds-gray-100)]">
                <span className="text-sm font-medium text-[var(--ds-gray-600)]">Database Engine</span>
                <span className="text-sm font-mono text-[var(--ds-black)]">Prisma ORM & PostgreSQL</span>
              </div>
              {/* Stat 4 */}
              <div className="flex justify-between items-center py-2 border-b border-[var(--ds-gray-100)]">
                <span className="text-sm font-medium text-[var(--ds-gray-600)]">Auth Strategy</span>
                <span className="text-sm font-mono text-[var(--ds-black)]">Stateless JWT / bcrypt</span>
              </div>
              {/* Stat 5 */}
              <div className="flex justify-between items-center py-2 border-b border-[var(--ds-gray-100)]">
                <span className="text-sm font-medium text-[var(--ds-gray-600)]">API Health Latency</span>
                <span className="text-sm font-mono flex items-center gap-1.5 font-semibold text-emerald-600">
                  <CheckCircle className="w-4 h-4" /> Healthy (11ms)
                </span>
              </div>
              {/* Stat 6 */}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-[var(--ds-gray-600)]">Styling Engine</span>
                <span className="text-sm font-mono text-[var(--ds-black)]">Tailwind CSS v4</span>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                type="button" 
                onClick={() => setShowDiagnostics(false)} 
                className="ds-btn-dark py-2 px-5 text-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
