
import { Suspense } from 'react';
import AuthForm from './components/auth-form';
import { Loader2 } from 'lucide-react';

function AuthLoading() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin" />
        </div>
    )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthForm />
    </Suspense>
  );
}
