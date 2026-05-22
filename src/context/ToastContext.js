import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext();

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, duration = 4000) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} onRemove={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ message, duration, onRemove }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onRemove();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onRemove]);

  return (
    <div className="pointer-events-auto bg-black text-white border border-neutral-800 px-4 py-3 rounded-md shadow-2xl flex items-center justify-between min-w-[280px] max-w-sm transition-all duration-300 transform translate-y-0 opacity-100 origin-bottom"
         style={{ animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideIn {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}} />
      <span className="text-sm font-medium tracking-tight whitespace-pre-wrap">{message}</span>
      <button 
        onClick={onRemove}
        className="ml-4 text-neutral-400 hover:text-white transition-colors focus:outline-none flex-shrink-0"
        aria-label="Close toast"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
}
