
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

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: appUser } = useDoc<AppUser>(userDocRef);

  useEffect(() => {
    if (!isUserLoading && user) {
        // Admin check
      if (user.email === ADMIN_EMAIL) {
        setIsAdmin(true);
        setIsApproved(true); // Admins are always approved
      } else {
        setIsAdmin(false);
        // Regular user approval check
        if (appUser) {
            setIsApproved(appUser.status === 'approved');
        } else {
            setIsApproved(false);
        }
      }
    } else {
      setIsAdmin(false);
      setIsApproved(false);
    }
  }, [user, isUserLoading, appUser]);

  return (
    <AdminAuthContext.Provider value={{ isAdmin, isApproved }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
