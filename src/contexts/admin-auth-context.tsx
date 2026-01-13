'use client';

import { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  email: string;
}

interface AdminAuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string) => void;
  logout: () => void;
}

export const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const AUTH_KEY = 'pharma_app_auth_v2';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_KEY);
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        if (authData.email) {
          setUser({ email: authData.email });
        }
      }
    } catch (e) {
      console.error("Failed to parse auth data from localStorage", e);
      localStorage.removeItem(AUTH_KEY);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((email: string) => {
    const newUser = { email };
    localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    setUser(newUser);
    // Instead of reloading, we push to the home page.
    // The AppContent component will handle rendering the correct view.
    router.push('/');
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
    // Force a reload to the login page to ensure all state is cleared
    window.location.href = '/login';
  }, []);

  return (
    <AdminAuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
