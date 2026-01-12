
'use client';

import { Suspense } from 'react';
import AuthComponent from './components/auth-component';

export default function AuthPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthComponent />
        </Suspense>
    );
}
