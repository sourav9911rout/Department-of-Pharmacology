
'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/app-sidebar';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider, useUser } from '@/firebase';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AdminAuthProvider } from '@/contexts/admin-auth-context';

function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isApproved } = useAdminAuth();
    const pathname = usePathname();
    const isAuthRoute = pathname.startsWith('/login');

    // If we are checking auth, or if user is not approved and not on an auth route, show loading.
    // The redirect is handled inside the AdminAuthProvider.
    if (!isApproved && !isAuthRoute) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-2">Loading...</p>
            </div>
        );
    }

    return <>{children}</>;
}


export default function Entry({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/auth');

    return (
        <FirebaseClientProvider>
          <AdminAuthProvider>
            {isAuthRoute ? (
                // For auth routes, render children directly without the main layout
                <div className="flex min-h-screen items-center justify-center bg-background">
                    {children}
                </div>
            ) : (
                <AuthGuard>
                    <SidebarProvider>
                        <AppSidebar />
                        <SidebarInset className='p-4 md:p-8'>{children}</SidebarInset>
                        <Toaster />
                    </SidebarProvider>
                </AuthGuard>
            )}
          </AdminAuthProvider>
        </FirebaseClientProvider>
    )
}
