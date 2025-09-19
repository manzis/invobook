// /context/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
// useRouter is not needed here anymore for logout
// import { useRouter } from 'next/router'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // 1. Add new state

  useEffect(() => {
    // ... your existing useEffect code ...
    const checkUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = (userData) => {
    setUser(userData);
    // You can still use router here for login
    window.location.href = '/dashboard'; 
  };

  const logout = async () => {
    setIsLoggingOut(true); // 2. Set loading state to true
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error("Error during server-side logout:", error);
    } finally {
      // The redirect will unmount everything, so no need to set isLoggingOut back to false.
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    // 3. Expose the new state
    <AuthContext.Provider value={{ user, setUser, login, logout, loading, isLoggingOut, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};