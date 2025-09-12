'use client';

import { createContext, useState, useEffect, useContext, useCallback } from 'react';

// 1. Crear el Contexto
const UserContext = createContext(null);

// 2. Crear el Proveedor (Provider)
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dashboard/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.socio); // Guardamos solo el objeto del socio
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const value = { user, setUser, loading, fetchUser };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// 3. Crear un hook personalizado para usar el contexto fácilmente
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
