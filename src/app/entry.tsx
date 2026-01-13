
'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/app-sidebar';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { AdminAuthProvider, useAdminAuth } from '@/contexts/admin-auth-context';
import LoginPage from './login/page';
import { useEffect, useState } from 'react';

function ProtectedRoutes({ children }: { children: React.ReactNode }) {
    const { user, isUserLoading } = useAdminAuth();
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/auth';

    if (isUserLoading) {
        return (
             <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-semibold">Loading Portal...</p>
                    <p className="text-muted-foreground">Please wait a moment.</p>
                </div>
            </div>
        )
    }

    if (!user && !isAuthPage) {
        return <LoginPage />;
    }
    
    if (user && isAuthPage) {
        // This is a simple client-side redirect. A more robust solution
        // might use next/navigation's useRouter for this.
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
        return null;
    }

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className='p-4 md:p-8'>{children}</SidebarInset>
        </SidebarProvider>
    );
}


export default function Entry({ children }: { children: React.ReactNode }) {
    return (
        <FirebaseClientProvider>
            <AdminAuthProvider>
                <ProtectedRoutes>
                    {children}
                </ProtectedRoutes>
                <Toaster />
            </AdminAuthProvider>
        </FirebaseClientProvider>
    );
}
