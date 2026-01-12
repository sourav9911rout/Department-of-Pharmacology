
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
    const { user, isUserLoading } = useUser();
    const { isAdmin } = useAdminAuth();
    const pathname = usePathname();
    const router = useRouter();

    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/auth');

    useEffect(() => {
        if (!isUserLoading) {
            // If user is not logged in and not on an auth route, redirect to login
            if (!user && !isAuthRoute) {
                router.push('/login');
            }
            // If user is logged in, but is not an admin, and tries to access a non-home page,
            // check their approval status. For this simple case, we just keep them on the home page.
            // A more complex app would check Firestore for the user's 'approved' status.
            if(user && !isAdmin && pathname !== '/') {
                 // A simple check to redirect non-admins from other pages.
                 // In a real app, you would fetch user's role from Firestore here.
                 // For now, we assume if they are logged in but not the admin, they are a regular user.
            }
        }
    }, [user, isUserLoading, isAdmin, pathname, router, isAuthRoute]);

    if (isUserLoading && !isAuthRoute) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    if (!user && !isAuthRoute) {
         return (
            <div className="flex h-screen w-full items-center justify-center">
                <p>Redirecting to login...</p>
                <Loader2 className="ml-2 h-8 w-8 animate-spin" />
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
            {isAuthRoute ? (
                 children
            ) : (
                <AdminAuthProvider>
                    <ProtectedRoutes>
                        <SidebarProvider>
                            <AppSidebar />
                            <SidebarInset className='p-4 md:p-8'>{children}</SidebarInset>
                            <Toaster />
                        </SidebarProvider>
                    </ProtectedRoutes>
                </AdminAuthProvider>
            )}
        </FirebaseClientProvider>
    )
}
