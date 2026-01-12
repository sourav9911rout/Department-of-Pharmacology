
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
  const [isAdmin, setIsAdminState] = useState(false);

  useEffect(() => {
    // Check sessionStorage for the admin state on initial load
    const storedIsAdmin = sessionStorage.getItem("isAdmin") === "true";
    if (storedIsAdmin) {
      setIsAdminState(true);
    }
  }, []);

  const setIsAdmin = (isAdmin: boolean) => {
    setIsAdminState(isAdmin);
    // Persist the admin state to sessionStorage
    sessionStorage.setItem("isAdmin", String(isAdmin));
  };
  
  const value = {
    isAdmin,
    setIsAdmin,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
