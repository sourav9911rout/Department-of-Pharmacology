
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
  const [isAdmin, setIsAdmin] = useState(true);
  const [isApproved, setIsApproved] = useState(true);

  // This effect is now bypassed by the default true state, but kept for easy switching back.
  useEffect(() => {
    // In dev mode, we are always admin.
    if (process.env.NODE_ENV === 'development') {
        setIsAdmin(true);
        setIsApproved(true);
        return;
    }
    
    if (!isUserLoading && user) {
      // Check for admin status
      if (user.email === ADMIN_EMAIL) {
        setIsAdmin(true);
        setIsApproved(true);
      } else {
        setIsAdmin(false);
        // Check for approval status from Firestore
        const userDocRef = doc(firestore, 'users', user.uid);
        // This is not ideal, but we'll fetch the doc once.
        // A proper implementation might use useDoc here, but that adds complexity.
        const getStatus = async () => {
          const { getDoc } = await import('firebase/firestore');
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const appUser = docSnap.data() as AppUser;
            setIsApproved(appUser.status === 'approved');
          } else {
            setIsApproved(false);
          }
        }
        getStatus();
      }
    } else {
      setIsAdmin(false);
      setIsApproved(false);
    }
  }, [user, isUserLoading, firestore]);

  return (
    <AdminAuthContext.Provider value={{ isAdmin: true, isApproved: true }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
