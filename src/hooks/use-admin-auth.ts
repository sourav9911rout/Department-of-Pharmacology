
"use client";

import { useContext, useCallback } from "react";
import { AdminAuthContext } from "@/contexts/admin-auth-context";
import { useRouter } from 'next/navigation';


export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  const router = useRouter();

  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }

  const { setUser, setIsAdmin, ...rest } = context;

  const login = useCallback((email: string) => {
    sessionStorage.setItem('userEmail', email);
    setUser({ email });
    router.push('/');
  }, [setUser, router]);

  const logout = useCallback(() => {
    sessionStorage.removeItem('userEmail');
    setUser(null);
    setIsAdmin(false);
    router.push('/login');
  }, [setUser, setIsAdmin, router]);

  return { ...rest, login, logout };
}
