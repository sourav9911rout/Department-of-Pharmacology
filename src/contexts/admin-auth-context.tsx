
"use client";

import { createContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useRouter, usePathname } from 'next/navigation';

interface AdminAuthContextType {
  isAdmin: boolean;
  isApproved: boolean;
  userEmail: string | null;
  isLoading: boolean;
  login: (email: string) => void;
  logout: () => void;
}

export const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdmin: false,
  isApproved: false,
  userEmail: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const verifyUser = useCallback((email: string | null) => {
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    if (email) {
      setUserEmail(email);
      const isAdminUser = email === adminEmail;
      setIsAdmin(isAdminUser);
      setIsApproved(true); // Admin is always approved
    } else {
      setUserEmail(null);
      setIsAdmin(false);
      setIsApproved(false);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('userEmail');
    verifyUser(storedEmail);
  }, [verifyUser]);

  useEffect(() => {
    if (!isLoading && !userEmail && pathname !== '/login' && pathname !== '/auth') {
      router.push('/login');
    }
  }, [isLoading, userEmail, pathname, router]);

  const login = useCallback(async (email: string) => {
    sessionStorage.setItem('userEmail', email);
    verifyUser(email);
    router.push('/');
  }, [router, verifyUser]);

  const logout = useCallback(() => {
    sessionStorage.removeItem('userEmail');
    setUserEmail(null);
    setIsAdmin(false);
    setIsApproved(false);
    router.push('/login');
  }, [router]);
  
  const value = {
    isAdmin,
    isApproved,
    userEmail,
    isLoading,
    login,
    logout
  };

  if (isLoading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-lg">Loading...</div>
        </div>
    )
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
