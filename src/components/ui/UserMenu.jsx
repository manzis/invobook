'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, User as UserIcon, LogOut, Settings } from 'lucide-react';

// Custom hook to detect clicks outside of the referenced element
function useOutsideAlerter(ref, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
}

const UserMenu = ({ user, onLogout, isCollapsed }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => setIsOpen(false)); // Close menu on outside click

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  // --- Menu Content ---
  // Extracted menu content to avoid repetition
  const menuContent = (
    <div className="p-2">
      {/* Show user info in dropdown when sidebar is collapsed */}
      {isCollapsed && (
        <div className="px-3 py-2 border-b border-gray-100 mb-1">
          <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Loading...'}</p>
          <p className="text-xs text-gray-500 truncate">{user?.email || '...'}</p>
        </div>
      )}
      <Link href="/settings" className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm rounded-lg hover:bg-gray-100">
        <UserIcon className="w-4 h-4 text-gray-500" />
        <span>My Profile</span>
      </Link>
      <Link href="/notifications" className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm rounded-lg hover:bg-gray-100">
        <Bell className="w-4 h-4 text-gray-500" />
        <span>Notifications</span>
      </Link>
      <Link href="/settings" className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm rounded-lg hover:bg-gray-100">
        <Settings className="w-4 h-4 text-gray-500" />
        <span>Settings</span>
      </Link>
      <div className="border-t border-gray-100 my-1"></div>
      <button 
        onClick={onLogout}
        className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-red-600 rounded-lg hover:bg-red-50"
      >
        <LogOut className="w-4 h-4" />
        <span>Logout</span>
      </button>
    </div>
  );

  return (
    <div ref={wrapperRef} className="relative flex justify-center">
      {/* The User Profile display area that triggers the menu */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center text-left rounded-lg hover:bg-gray-100 transition-all duration-200
                   ${isCollapsed ? 'w-10 h-10 justify-center' : 'w-full space-x-3 px-3 py-2'}`}
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-medium">{initials}</span>
        </div>
        
        {/* User Info (Expanded View) */}
        {!isCollapsed && (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Loading...'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || '...'}</p>
            </div>
            <Bell className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </>
        )}
      </button>

      {/* The Popup Menu */}
      {isOpen && (
        <div 
          className={`absolute bottom-full mb-2 bg-white rounded-xl shadow-lg border border-gray-200
                     ${isCollapsed ? 'left-full ml-2 w-56' : 'left-0 right-0 w-full'}`}
          style={{ zIndex: 50 }}
        >
          {menuContent}
        </div>
      )}
    </div>
  );
};

export default UserMenu;