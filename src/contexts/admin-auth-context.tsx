
'use client';

import { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface User {
    email: string;
}

interface AdminAuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string) => void;
  logout: () => void;
}

export const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('userEmail');
    if (storedEmail) {
      setUser({ email: storedEmail });
    }
    setIsLoading(false);
  }, []);

  const login = (email: string) => {
    sessionStorage.setItem('userEmail', email);
    setUser({ email });
    router.push('/');
  };

  const logout = useCallback(() => {
    sessionStorage.removeItem('userEmail');
    setUser(null);
    router.push('/login');
  }, [router]);

  useEffect(() => {
    if (isLoading) return;

    const publicPaths = ['/login', '/auth'];
    const pathIsPublic = publicPaths.some(p => pathname.startsWith(p));
    
    if (!user && !pathIsPublic) {
      router.push('/login');
    }
     if (user && pathIsPublic && pathname !== '/auth') {
       router.push('/');
     }

  }, [user, pathname, router, isLoading]);


  const isAdmin = user?.email.toLowerCase() === adminEmail?.toLowerCase();

  const value = {
    user,
    isAdmin,
    login,
    logout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
