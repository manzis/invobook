'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, User as UserIcon, LogOut, Settings } from 'lucide-react';

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

  const menuContent = (
    <div className="p-2">
      {isCollapsed && (
        <div className="px-3 py-2 mb-1" style={{ borderBottom: '1px solid var(--ds-gray-100)' }}>
          <p className="text-sm font-medium m-0 truncate" style={{ color: 'var(--ds-black)' }}>
            {user?.name || 'Loading...'}
          </p>
          <p className="text-xs m-0 mt-1 truncate" style={{ color: 'var(--ds-gray-500)' }}>
            {user?.email || '...'}
          </p>
        </div>
      )}
      <Link href="/settings" className="ds-dropdown-item no-underline">
        <UserIcon className="w-4 h-4 mr-2" />
        <span>My Profile</span>
      </Link>
      <Link href="/notifications" className="ds-dropdown-item no-underline">
        <Bell className="w-4 h-4 mr-2" />
        <span>Notifications</span>
      </Link>
      <Link href="/settings" className="ds-dropdown-item no-underline">
        <Settings className="w-4 h-4 mr-2" />
        <span>Settings</span>
      </Link>
      <div className="my-1" style={{ height: 1, background: 'var(--ds-gray-100)' }} />
      <button type="button" onClick={onLogout} className="ds-dropdown-item ds-dropdown-item-danger">
        <LogOut className="w-4 h-4 mr-2" />
        <span>Logout</span>
      </button>
    </div>
  );

  return (
    <div ref={wrapperRef} className="relative flex justify-center w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center text-left rounded-md transition-colors w-full border-0 bg-transparent cursor-pointer hover:bg-[var(--ds-gray-50)] ${
          isCollapsed ? 'w-10 h-10 justify-center p-0' : 'gap-3 px-3 py-2'
        }`}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--ds-black)' }}
        >
          <span className="text-sm font-medium" style={{ color: 'var(--ds-white)' }}>
            {initials}
          </span>
        </div>
        {!isCollapsed && (
          <>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium m-0 truncate" style={{ color: 'var(--ds-black)' }}>
                {user?.name || 'Loading...'}
              </p>
              <p className="text-xs m-0 truncate" style={{ color: 'var(--ds-gray-500)' }}>
                {user?.email || '...'}
              </p>
            </div>
            <Bell className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--ds-gray-400)' }} />
          </>
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute bottom-full mb-2 ds-dropdown-content ${
            isCollapsed ? 'left-full ml-2 w-56' : 'left-0 right-0 w-full'
          }`}
          style={{ zIndex: 50 }}
        >
          {menuContent}
        </div>
      )}
    </div>
  );
};

export default UserMenu;
