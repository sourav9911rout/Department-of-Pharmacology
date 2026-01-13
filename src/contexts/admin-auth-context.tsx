
'use client';

import { createContext, useState, ReactNode, useEffect } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';

interface User {
    email: string;
}

interface AdminAuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  isUserLoading: boolean;
}

export const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const { currentUserData, isLoading: isCurrentUserDataLoading } = useCurrentUser(user?.email);

  useEffect(() => {
      const storedEmail = sessionStorage.getItem('userEmail');
      if (storedEmail) {
          setUser({ email: storedEmail });
      }
      setIsAuthLoading(false);
  }, []);

  useEffect(() => {
      if (currentUserData) {
          setIsAdmin(currentUserData.role === 'admin');
      } else {
          setIsAdmin(false);
      }
  }, [currentUserData]);


  return (
    <AdminAuthContext.Provider value={{ user, setUser, isAdmin, setIsAdmin, isUserLoading: isAuthLoading || isCurrentUserDataLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
