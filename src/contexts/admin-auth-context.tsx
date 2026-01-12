
"use client";

import { createContext, useState, ReactNode, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

interface AdminAuthContextType {
  isAdmin: boolean;
  isApproved: boolean;
  userEmail: string | null;
  login: (email: string, isAdmin: boolean) => void;
  logout: () => void;
}

export const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdmin: false,
  isApproved: false,
  userEmail: null,
  login: () => {},
  logout: () => {},
});

const AUTH_STORAGE_KEY = "pharma_app_auth";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        const { email, admin } = JSON.parse(storedAuth);
        if (email) {
          setUserEmail(email);
          setIsAdmin(admin);
          setIsApproved(true);
        }
      }
    } catch (error) {
      console.error("Failed to parse auth from localStorage", error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((email: string, admin: boolean) => {
    const authData = { email, admin };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    setUserEmail(email);
    setIsAdmin(admin);
    setIsApproved(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUserEmail(null);
    setIsAdmin(false);
    setIsApproved(false);
    router.push('/login');
  }, [router]);

  // Protection logic
  useEffect(() => {
    if (isLoading) return;

    const isAuthRoute = pathname.startsWith('/login');
    
    if (!isApproved && !isAuthRoute) {
      router.push('/login');
    }
    
    if (isApproved && isAuthRoute) {
      router.push('/');
    }

  }, [isLoading, isApproved, pathname, router]);


  return (
    <AdminAuthContext.Provider value={{ isAdmin, isApproved, userEmail, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
