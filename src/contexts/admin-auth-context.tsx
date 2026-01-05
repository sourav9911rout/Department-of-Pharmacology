"use client";

import { createContext, useState, Dispatch, SetStateAction, ReactNode } from "react";

interface AdminAuthContextType {
  isAdmin: boolean;
  setIsAdmin: Dispatch<SetStateAction<boolean>>;
}

export const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <AdminAuthContext.Provider value={{ isAdmin, setIsAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
