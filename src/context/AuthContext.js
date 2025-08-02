// /context/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const router = useRouter();

  useEffect(() => {
    // This effect runs on initial mount to check if the user is already logged in
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
    router.push('/dashboard'); // Or your main app page
  };

  const logout = async () => {
    await fetch('/api/auth/logout');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};