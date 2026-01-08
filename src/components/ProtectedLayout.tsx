
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
    if (!isUserLoading && !user) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(redirectUrl);
    }
  }, [isUserLoading, user, router, pathname]);
  
  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <ShieldCheck className="w-16 h-16 text-primary mb-4 animate-pulse" />
        <p className="text-muted-foreground">Securing connection...</p>
      </div>
    );
  }

  return <>{children}</>;
}
