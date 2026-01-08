
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

  // Check if the current route is public.
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    // If authentication is still loading, or if the route is public, do nothing yet.
    if (isUserLoading || isPublicRoute) {
      return;
    }

    // If auth has loaded, the route is not public, and there's no user, redirect to login.
    if (!user) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(redirectUrl);
    }
  }, [isUserLoading, user, router, pathname, isPublicRoute]);

  // If the route is public, render the content directly.
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // For protected routes, if auth is still loading or there's no user, show a loading screen.
  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <ShieldCheck className="w-16 h-16 text-primary mb-4 animate-pulse" />
        <p className="text-muted-foreground">Securing connection...</p>
      </div>
    );
  }
  
  // If the user is authenticated, show the protected app content.
  return <>{children}</>;
}
