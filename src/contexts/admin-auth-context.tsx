
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
    () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: appUser } = useDoc<AppUser>(userDocRef);

  useEffect(() => {
    if (!isUserLoading && user) {
      // Check for admin status
      if (user.email === ADMIN_EMAIL) {
        setIsAdmin(true);
        setIsApproved(true);
      } else {
        setIsAdmin(false);
        // Check for approval status from Firestore
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
  }, [user, appUser, isUserLoading]);

  return (
    <AdminAuthContext.Provider value={{ isAdmin, isApproved }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
