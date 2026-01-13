'use client';

import { createContext, useState, ReactNode, useEffect, useCallback } from 'react';

interface AdminAuthContextType {
  isAdmin: boolean;
  isAuthLoading: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
  showPinDialog: boolean;
  setShowPinDialog: (show: boolean) => void;
}

export const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_AUTH_KEY = 'pharma_app_admin_auth';

// It's safe to have a default fallback for the PIN.
const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || '123456';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showPinDialog, setShowPinDialog] = useState(false);

  useEffect(() => {
    try {
      const storedAuth = sessionStorage.getItem(ADMIN_AUTH_KEY);
      if (storedAuth) {
        setIsAdmin(JSON.parse(storedAuth));
      }
    } catch (e) {
      console.error("Failed to parse auth data from sessionStorage", e);
    }
    setIsAuthLoading(false);
  }, []);

  const login = useCallback((pin: string) => {
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
      setIsAdmin(true);
      setShowPinDialog(false);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAdmin(false);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ isAdmin, isAuthLoading, login, logout, showPinDialog, setShowPinDialog }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
