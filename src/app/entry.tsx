'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/app-sidebar';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { AdminAuthProvider } from '@/contexts/admin-auth-context';
import AdminPinDialog from '@/components/admin-pin-dialog';

export default function Entry({ children }: { children: React.ReactNode }) {
    return (
        <FirebaseClientProvider>
            <AdminAuthProvider>
                <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset className='p-4 md:p-8'>{children}</SidebarInset>
                </SidebarProvider>
                <AdminPinDialog />
                <Toaster />
            </AdminAuthProvider>
        </FirebaseClientProvider>
    );
}
