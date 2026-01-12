
"use client";

import { createContext, useState, ReactNode, useEffect } from "react";
import { useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc } from 'firebase/firestore';
import { useCollection, useDoc } from "@/firebase";
import type { AppUser } from "@/lib/types";

interface AdminAuthContextType {
  isAdmin: boolean;
  isApproved: boolean;
}

export const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdmin: false,
  isApproved: false,
});

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  // Firestore query to get the app-specific user profile
  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: appUser } = useDoc<AppUser>(userDocRef);

  useEffect(() => {
    if (isUserLoading) return;

    if (user) {
      // Check if the logged-in user is the designated admin
      const isAdminUser = user.email === ADMIN_EMAIL;
      if (isAdminUser) {
        setIsAdmin(true);
        setIsApproved(true);
        return; 
      }
      
      // For non-admin users, check their status from the Firestore document
      if (appUser) {
        setIsApproved(appUser.status === 'approved');
      } else {
        setIsApproved(false);
      }
      setIsAdmin(false);

    } else {
      // No user is logged in
      setIsAdmin(false);
      setIsApproved(false);
    }
  }, [user, isUserLoading, appUser, firestore]);

  return (
    <AdminAuthContext.Provider value={{ isAdmin, isApproved }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
