
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase/provider';
import { useEffect, type ReactNode } from 'react';
import { ShieldCheck } from 'lucide-react';

export function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If auth is still loading, or if we are already on the login page, do nothing yet.
    if (isUserLoading || pathname === '/login') {
      return;
    }

    // If auth has loaded and there's no user, redirect to login.
    if (!user) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(redirectUrl);
    }
  }, [isUserLoading, user, router, pathname]);

  // If we are on the login page, render it directly.
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // If authentication is still in progress, show a loading screen.
  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <ShieldCheck className="w-16 h-16 text-primary mb-4 animate-pulse" />
        <p className="text-muted-foreground">Securing connection...</p>
      </div>
    );
  }
  
  // If the user is authenticated and not on the login page, show the app content.
  return <>{children}</>;
}
