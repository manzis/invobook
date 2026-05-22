'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { 
  Bell, 
  Settings, 
  MoreHorizontal,
  SmilePlus,
  Monitor,
  Sun,
  Moon,
  Home,
  FileText,
  LifeBuoy,
  BookOpen,
  LogOut
} from 'lucide-react';

const UserMenu = ({ user, onLogout, isCollapsed }) => {
  const [theme, setTheme] = useState('system'); // system, light, dark

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || '?';

  const username = user?.name?.toLowerCase().replace(/\s+/g, '') || 'guest';
  const email = user?.email || 'guest@example.com';

  const menuContent = (
    <DropdownMenu.Content
      className="ds-dropdown-content origin-top-left data-[side=top]:animate-slide-down data-[side=bottom]:animate-slide-up w-[260px] p-0"
      sideOffset={8}
      align="start"
      alignOffset={isCollapsed ? -8 : -20}
      side="top"
    >
      {/* Header section */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--ds-gray-100)]">
        <div className="flex flex-col min-w-0 pr-2">
          <span className="text-[13px] font-semibold text-[var(--ds-black)] truncate">{user?.name || 'Guest'}</span>
          <span className="text-[12px] text-[var(--ds-gray-500)] truncate">{email}</span>
        </div>
        <Link href="/settings" className="text-[var(--ds-gray-500)] hover:text-[var(--ds-black)] transition-colors flex-shrink-0">
          <Settings className="w-4 h-4" />
        </Link>
      </div>

      {/* Feedback Button inside menu */}
      <div className="p-1.5">
        <DropdownMenu.Item className="outline-none">
          <button 
            type="button" 
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-[var(--ds-gray-100)] transition-colors text-[13px] text-[var(--ds-gray-600)] hover:text-[var(--ds-black)]"
            onClick={(e) => {
              e.preventDefault();
              window.open('mailto:feedback@invobook.com');
            }}
          >
            Feedback
            <SmilePlus className="w-4 h-4" />
          </button>
        </DropdownMenu.Item>
      </div>

      <div className="px-1.5 pb-1 space-y-[2px]">
        {/* Theme Toggler */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-[var(--ds-gray-100)] transition-colors cursor-default">
          <span className="text-[13px] text-[var(--ds-gray-600)]">Theme</span>
          <div className="flex items-center border border-[var(--ds-gray-100)] rounded-full p-0.5 bg-[var(--ds-white)]">
            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); setTheme('system'); }}
              className={`p-1 rounded-full flex items-center justify-center transition-colors outline-none ${theme === 'system' ? 'bg-[var(--ds-gray-100)] text-[var(--ds-black)]' : 'text-[var(--ds-gray-400)] hover:text-[var(--ds-gray-600)]'}`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); setTheme('light'); }}
              className={`p-1 rounded-full flex items-center justify-center transition-colors outline-none ${theme === 'light' ? 'bg-[var(--ds-gray-100)] text-[var(--ds-black)]' : 'text-[var(--ds-gray-400)] hover:text-[var(--ds-gray-600)]'}`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); setTheme('dark'); }}
              className={`p-1 rounded-full flex items-center justify-center transition-colors outline-none ${theme === 'dark' ? 'bg-[var(--ds-gray-100)] text-[var(--ds-black)]' : 'text-[var(--ds-gray-400)] hover:text-[var(--ds-gray-600)]'}`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <DropdownMenu.Item asChild>
          <Link href="/dashboard" className="flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-[var(--ds-gray-100)] text-[13px] text-[var(--ds-gray-600)] hover:text-[var(--ds-black)] transition-colors outline-none cursor-pointer no-underline">
            Home Page
            <Home className="w-4 h-4 text-[var(--ds-gray-500)]" />
          </Link>
        </DropdownMenu.Item>
        <DropdownMenu.Item asChild>
          <Link href="/invoices" className="flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-[var(--ds-gray-100)] text-[13px] text-[var(--ds-gray-600)] hover:text-[var(--ds-black)] transition-colors outline-none cursor-pointer no-underline">
            Invoices
            <FileText className="w-4 h-4 text-[var(--ds-gray-500)]" />
          </Link>
        </DropdownMenu.Item>
        <DropdownMenu.Item asChild>
          <Link href="#" className="flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-[var(--ds-gray-100)] text-[13px] text-[var(--ds-gray-600)] hover:text-[var(--ds-black)] transition-colors outline-none cursor-pointer no-underline">
            Help
            <LifeBuoy className="w-4 h-4 text-[var(--ds-gray-500)]" />
          </Link>
        </DropdownMenu.Item>
        <DropdownMenu.Item asChild>
          <Link href="#" className="flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-[var(--ds-gray-100)] text-[13px] text-[var(--ds-gray-600)] hover:text-[var(--ds-black)] transition-colors outline-none cursor-pointer no-underline">
            Docs
            <BookOpen className="w-4 h-4 text-[var(--ds-gray-500)]" />
          </Link>
        </DropdownMenu.Item>
        <DropdownMenu.Item asChild>
          <button type="button" onClick={onLogout} className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-[var(--ds-gray-100)] text-[13px] text-[var(--ds-gray-600)] hover:text-[var(--ds-black)] transition-colors outline-none cursor-pointer">
            Log Out
            <LogOut className="w-4 h-4 text-[var(--ds-gray-500)]" />
          </button>
        </DropdownMenu.Item>

        <div className="pt-1.5 pb-0.5">
          <DropdownMenu.Item asChild>
            <Link href="/billing" className="w-full flex items-center justify-center px-3 py-2 bg-[var(--ds-black)] hover:bg-[#1a1a1a] text-[var(--ds-white)] rounded-md text-[13px] font-semibold transition-colors outline-none cursor-pointer no-underline">
              Upgrade to Pro
            </Link>
          </DropdownMenu.Item>
        </div>
      </div>

      <div className="border-t border-[var(--ds-gray-100)] bg-[var(--ds-gray-50)] p-3 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[12px] text-[var(--ds-gray-500)]">Platform Status</span>
            <span className="text-[13px] text-[var(--ds-black)]">All systems normal.</span>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
        </div>
      </div>
    </DropdownMenu.Content>
  );

  return (
    <DropdownMenu.Root>
      {isCollapsed ? (
        <div className="relative flex justify-center w-full">
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--ds-black)] border-0 cursor-pointer hover:opacity-90 outline-none"
            >
              <span className="text-[11px] font-semibold text-[var(--ds-white)]">
                {initials}
              </span>
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            {menuContent}
          </DropdownMenu.Portal>
        </div>
      ) : (
        <div className="relative flex items-center justify-between w-full select-none">
          {/* Left side: Avatar + Username */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--ds-black)' }}
            >
              <span className="text-[10px] font-semibold text-[var(--ds-white)]">
                {initials}
              </span>
            </div>
            <span className="text-[13px] font-semibold truncate text-[var(--ds-black)] tracking-tight">
              {username}
            </span>
          </div>

          {/* Right side: Action menu button and notifications */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Three dots actions */}
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="w-7 h-7 rounded-full border border-[var(--ds-gray-100)] bg-[var(--ds-white)] hover:bg-[var(--ds-gray-100)] text-[var(--ds-gray-500)] hover:text-[var(--ds-black)] flex items-center justify-center cursor-pointer transition-colors outline-none"
                aria-label="User Options Menu"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </DropdownMenu.Trigger>

            {/* Notifications Bell */}
            <Link
              href="/settings"
              className="relative w-7 h-7 rounded-full border border-[var(--ds-gray-100)] bg-[var(--ds-white)] hover:bg-[var(--ds-gray-100)] text-[var(--ds-gray-500)] hover:text-[var(--ds-black)] flex items-center justify-center cursor-pointer transition-colors outline-none no-underline"
              title="Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-[3px] right-[3px] w-[6px] h-[6px] bg-[#0070f3] rounded-full border border-white" />
            </Link>
          </div>
          <DropdownMenu.Portal>
            {menuContent}
          </DropdownMenu.Portal>
        </div>
      )}
    </DropdownMenu.Root>
  );
};

export default UserMenu;
