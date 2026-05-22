'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, User as UserIcon, LogOut, Settings, MoreHorizontal } from 'lucide-react';

function useOutsideAlerter(ref, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) callback();
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref, callback]);
}

const UserMenu = ({ user, onLogout, isCollapsed }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => setIsOpen(false));

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || '?';

  const username = user?.name?.toLowerCase().replace(/\s+/g, '') || 'guest';

  const menuContent = (
    <div className="p-1">
      {isCollapsed && (
        <div className="px-2 py-1.5 mb-1 border-b border-[var(--ds-gray-100)]">
          <p className="text-xs font-semibold m-0 truncate text-[var(--ds-black)]">
            {user?.name || 'Guest'}
          </p>
          <p className="text-[10px] m-0 mt-0.5 truncate text-[var(--ds-gray-500)]">
            {user?.email || '...'}
          </p>
        </div>
      )}
      <Link href="/settings" onClick={() => setIsOpen(false)} className="ds-dropdown-item no-underline">
        <UserIcon className="w-4 h-4 mr-2 text-[var(--ds-gray-500)]" />
        <span>My Profile</span>
      </Link>
      <Link href="/settings" onClick={() => setIsOpen(false)} className="ds-dropdown-item no-underline">
        <Settings className="w-4 h-4 mr-2 text-[var(--ds-gray-500)]" />
        <span>Settings</span>
      </Link>
      <div className="my-1 border-t border-[var(--ds-gray-100)]" />
      <button type="button" onClick={onLogout} className="ds-dropdown-item ds-dropdown-item-danger">
        <LogOut className="w-4 h-4 mr-2" />
        <span>Logout</span>
      </button>
    </div>
  );

  if (isCollapsed) {
    return (
      <div ref={wrapperRef} className="relative flex justify-center w-full">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--ds-black)] border-0 cursor-pointer hover:opacity-90"
        >
          <span className="text-xs font-medium text-[var(--ds-white)]">
            {initials}
          </span>
        </button>

        {isOpen && (
          <div
            className="absolute bottom-full mb-2 left-full ml-2 w-48 ds-dropdown-content"
            style={{ zIndex: 50 }}
          >
            {menuContent}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative flex items-center justify-between w-full select-none">
      {/* Left side: Avatar + Username */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--ds-black)' }}
        >
          <span className="text-[10px] font-semibold text-[var(--ds-white)]">
            {initials}
          </span>
        </div>
        <span className="text-sm font-medium truncate text-[var(--ds-black)] tracking-tight">
          {username}
        </span>
      </div>

      {/* Right side: Action menu button and notifications */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Three dots actions */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-7 h-7 rounded-full border border-[var(--ds-gray-100)] bg-transparent hover:bg-[var(--ds-gray-50)] text-[var(--ds-gray-500)] hover:text-[var(--ds-black)] flex items-center justify-center cursor-pointer transition-colors"
          aria-label="User Options Menu"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>

        {/* Notifications Bell */}
        <Link
          href="/settings"
          className="relative w-7 h-7 rounded-full border border-[var(--ds-gray-100)] bg-transparent hover:bg-[var(--ds-gray-50)] text-[var(--ds-gray-500)] hover:text-[var(--ds-black)] flex items-center justify-center cursor-pointer transition-colors"
          title="Notifications"
        >
          <Bell className="w-3.5 h-3.5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--ds-develop-blue)] rounded-full border border-white" />
        </Link>
      </div>

      {isOpen && (
        <div
          className="absolute bottom-full mb-2 right-0 w-48 ds-dropdown-content"
          style={{ zIndex: 50 }}
        >
          {menuContent}
        </div>
      )}
    </div>
  );
};

export default UserMenu;
