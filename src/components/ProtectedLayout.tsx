
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase/provider';
import { useEffect, type ReactNode } from 'react';
import { ShieldCheck } from 'lucide-react';

// Define which routes are public and do not require authentication.
const PUBLIC_ROUTES = ['/', '/login'];

export function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    // If authentication is still loading, don't do anything yet.
    if (isUserLoading) {
      return;
    }

    // If the route is protected and there's no user, redirect to login.
    // Include the original path as a query param to redirect back after login.
    if (!isPublicRoute && !user) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(redirectUrl);
    }
  }, [isUserLoading, user, router, pathname, isPublicRoute]);

  // For public routes, always render the content.
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // For protected routes, show a loading screen while checking auth.
  // If auth has been checked and there is no user, the useEffect above will have already
  // started the redirect, so this loading screen will show briefly.
  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <ShieldCheck className="w-16 h-16 text-primary mb-4 animate-pulse" />
        <p className="text-muted-foreground">Securing connection...</p>
      </div>
    );
  }
  
  // If we are on a protected route and the user is authenticated, show the content.
  return <>{children}</>;
}
