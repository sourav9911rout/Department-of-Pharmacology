
"use client";

import { createContext, useState, ReactNode, useEffect } from "react";

interface AdminAuthContextType {
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

export const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdmin: false,
  setIsAdmin: () => {},
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  
  // This effect can be used to persist admin state if needed
  useEffect(() => {
    // For example, using sessionStorage to keep admin state across reloads for a short period
    const storedAdmin = sessionStorage.getItem('isAdmin');
    if (storedAdmin === 'true') {
        setIsAdmin(true);
    }
  }, []);
  
  useEffect(() => {
    sessionStorage.setItem('isAdmin', String(isAdmin));
  }, [isAdmin]);

  return (
    <AdminAuthContext.Provider value={{ isAdmin, setIsAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
