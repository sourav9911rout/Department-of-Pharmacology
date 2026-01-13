'use client';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import type { AppUser } from '@/lib/types';

export function useCurrentUser(email?: string | null) {
  const [currentUserData, setCurrentUserData] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    if (!email || !firestore) {
      setCurrentUserData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('email', '==', email.toLowerCase()));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        setCurrentUserData({ id: userDoc.id, ...userDoc.data() } as AppUser);
      } else {
        setCurrentUserData(null);
      }
      setIsLoading(false);
    }, (error) => {
        console.error("Failed to fetch current user data:", error);
        setCurrentUserData(null);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [email, firestore]);

  return { currentUserData, isLoading };
}
