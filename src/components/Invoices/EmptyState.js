// /components/Invoices/EmptyState.jsx

import React from 'react';
import { Plus } from 'lucide-react';

const EmptyState = ({ onNewInvoiceClick }) => {
  return (
    // --- THIS IS THE KEY CHANGE ---
    // We use flexbox to fill the height and center the content both vertically and horizontally.
    // h-full: Takes the full height of its parent container.
    // flex, flex-col: Sets up a vertical flexbox layout.
    // justify-center: Centers the content vertically.
    // items-center: Centers the content horizontally.
    <div className="h-full flex flex-col items-center justify-center p-6">
      
      {/* The content itself is now wrapped for clean centering */}
      <div className="text-center">
        <div className="mx-auto w-48 h-48">
          {/* Professional SVG Illustration */}
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <g>
              <path fill="#D1E9FF" d="M100 10c-15.9 0-28.8 12.9-28.8 28.8S84.1 67.6 100 67.6s28.8-12.9 28.8-28.8S115.9 10 100 10z"/>
              <path fill="#4A90E2" d="M100 16.5c-12.3 0-22.3 10-22.3 22.3s10 22.3 22.3 22.3 22.3-10 22.3-22.3-10-22.3-22.3-22.3zm0 38c-8.7 0-15.8-7.1-15.8-15.8S91.3 23 100 23s15.8 7.1 15.8 15.8-7.1 15.7-15.8 15.7z"/>
              <path fill="#D1E9FF" d="M150 70H50c-8.3 0-15 6.7-15 15v90c0 8.3 6.7 15 15 15h100c8.3 0 15-6.7 15-15V85c0-8.3-6.7-15-15-15z"/>
              <path fill="#F3F8FF" d="M45 80h110v95H45z"/>
              <rect x="60" y="100" width="80" height="8" rx="4" fill="#A8D4FF"/>
              <rect x="60" y="120" width="60" height="8" rx="4" fill="#A8D4FF"/>
              <rect x="60" y="140" width="80" height="8" rx="4" fill="#A8D4FF"/>
              <rect x="60" y="160" width="30" height="8" rx="4" fill="#A8D4FF"/>
              <path fill="#4A90E2" d="M125 155h20v20h-20z" transform="rotate(-15 135 165)"/>
              <path fill="#FFFFFF" d="M136 158l-6 6-3-3 1.5-1.5 1.5 1.5 4.5-4.5z"/>
            </g>
          </svg>
        </div>
        <h2 className="mt-6 text-xl font-semibold text-slate-800">
          No Invoices Found
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          It looks like you haven't created any invoices yet.
        </p>
        <div className="mt-6">
          <button
            onClick={onNewInvoiceClick}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Create Your First Invoice
          </button>
        </div>
      </div>

    </div>
  );
};

export default EmptyState;