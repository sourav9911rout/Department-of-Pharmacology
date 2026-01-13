'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/app-sidebar';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { AdminAuthProvider } from '@/contexts/admin-auth-context';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import LoginPage from './login/page';
import { useEffect, useState } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';

function AppContent({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAdminAuth();
    const { currentUserData, isLoading: isUserDataLoading } = useCurrentUser(user?.email);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient || isLoading || isUserDataLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }
    
    if (!user || !currentUserData || currentUserData.status !== 'approved') {
        return <LoginPage />;
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
                <AppContent>{children}</AppContent>
                <Toaster />
            </AdminAuthProvider>
        </FirebaseClientProvider>
    );
}
