
'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/app-sidebar';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider, useUser } from '@/firebase';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { AdminAuthProvider } from '@/contexts/admin-auth-context';

function ProtectedRoutes({ children }: { children: React.ReactNode }) {
    const { isUserLoading } = useUser();
    const { isApproved } = useAdminAuth();
    const pathname = usePathname();
    const router = useRouter();

    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/auth');

    useEffect(() => {
        if (!isUserLoading) {
            // If user is not approved and not on an auth route,
            // redirect them to the login page.
            if (!isApproved && !isAuthRoute) {
                router.push('/login');
            }
        }
    }, [isUserLoading, isApproved, pathname, router, isAuthRoute]);

    // Show a loading spinner while we check the user's status, unless it's an auth route.
    if (isUserLoading && !isAuthRoute) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    // If the routes are protected and the user isn't approved, show a redirecting message.
    if (!isApproved && !isAuthRoute) {
         return (
            <div className="flex h-screen w-full items-center justify-center">
                <p>Redirecting to login...</p>
                <Loader2 className="ml-2 h-8 w-8 animate-spin" />
            </div>
        );
    }

    // Otherwise, render the requested page content.
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
                <ProtectedRoutes>
                    <SidebarProvider>
                        <AppSidebar />
                        <SidebarInset className='p-4 md:p-8'>{children}</SidebarInset>
                        <Toaster />
                    </SidebarProvider>
                </ProtectedRoutes>
            )}
          </AdminAuthProvider>
        </FirebaseClientProvider>
    )
}
