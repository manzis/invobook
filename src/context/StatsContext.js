import React, { createContext, useContext, useState, useEffect } from 'react';

const StatsContext = createContext({
  showStats: true,
  setShowStats: () => {},
  toggleStats: () => {},
});

export function StatsProvider({ children }) {
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('invobook_show_stats');
      if (saved !== null) {
        setShowStats(saved === 'true');
      } else if (window.innerWidth < 768) {
        setShowStats(false);
      }
    }
  }, []);

  const toggleStats = () => {
    setShowStats((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('invobook_show_stats', String(next));
      }
      return next;
    });
  };

  return (
    <StatsContext.Provider value={{ showStats, setShowStats, toggleStats }}>
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  return useContext(StatsContext);
}
