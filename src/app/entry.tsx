
'use client';
import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/app-sidebar';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { AdminAuthProvider } from '@/contexts/admin-auth-context';

export default function Entry({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/auth');

    return (
        <FirebaseClientProvider>
            <AdminAuthProvider>
                {isAuthPage ? (
                    <>
                        {children}
                        <Toaster />
                    </>
                ) : (
                    <SidebarProvider>
                        <AppSidebar />
                        <SidebarInset className='p-4 md:p-8'>{children}</SidebarInset>
                        <Toaster />
                    </SidebarProvider>
                )}
            </AdminAuthProvider>
        </FirebaseClientProvider>
    );
}
