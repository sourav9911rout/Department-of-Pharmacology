
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminAuth } from '@/hooks/use-admin-auth';

function AuthComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAdminAuth();

  useEffect(() => {
    const email = searchParams.get('email');
    if (email) {
      login(email);
      router.push('/');
    } else {
      // Handle cases where email is missing
      console.error("Email missing in auth callback");
      router.push('/login?error=auth_failed');
    }
  }, [searchParams, login, router]);

  return (
    <div className="flex h-screen items-center justify-center">
        <div className="text-center">
            <p className="text-lg font-semibold">Logging you in...</p>
            <p className="text-muted-foreground">Please wait while we verify your credentials.</p>
        </div>
    </div>
  );
}

export default AuthComponent;
