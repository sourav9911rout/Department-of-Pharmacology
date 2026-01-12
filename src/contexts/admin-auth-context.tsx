
"use client";

import { createContext, useState, ReactNode, useEffect } from "react";
import { useUser } from "@/firebase";

interface AdminAuthContextType {
  isAdmin: boolean;
}

export const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdmin: false,
});

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isUserLoading && user) {
      if (user.email === ADMIN_EMAIL) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, [user, isUserLoading]);

  return (
    <AdminAuthContext.Provider value={{ isAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
