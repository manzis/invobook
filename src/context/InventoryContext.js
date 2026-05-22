import React, { createContext, useContext, useState, useEffect } from 'react';

const InventoryContext = createContext({
  inventoryEnabled: false,
  setInventoryEnabled: () => {},
  loading: true,
});

export function InventoryProvider({ children }) {
  const [inventoryEnabled, setInventoryEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventoryStatus = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setInventoryEnabled(!!data.inventoryEnabled);
        }
      } catch (err) {
        console.error('Failed to fetch inventory status:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventoryStatus();
  }, []);

  return (
    <InventoryContext.Provider value={{ inventoryEnabled, setInventoryEnabled, loading }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  return useContext(InventoryContext);
}
