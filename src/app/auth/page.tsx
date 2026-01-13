'use client';

import { Suspense } from 'react';
import AuthComponent from './components/auth-component';

export default function AuthPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><p>Loading...</p></div>}>
            <AuthComponent />
        </Suspense>
    );
}
