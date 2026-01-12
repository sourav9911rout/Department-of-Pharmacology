
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/firebase';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AuthForm() {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>(
    'verifying'
  );
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Return early if auth is not yet initialized
    if (!auth) {
      return;
    }
      
    const signIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          // This can happen if the user opens the link on a different device.
          // We can prompt the user for their email.
          email = window.prompt(
            'Please provide your email for confirmation'
          );
        }
        if (!email) {
          setErrorMessage(
            'Email not found. Please try the sign-in process again.'
          );
          setStatus('error');
          return;
        }

        try {
          await signInWithEmailLink(auth, email, window.location.href);
          window.localStorage.removeItem('emailForSignIn');
          setStatus('success');
          toast({
            title: 'Successfully signed in!',
            description: 'Redirecting you to the dashboard...',
          });
          router.push('/');
        } catch (error: any) {
          console.error('Sign in with email link error:', error);
          setErrorMessage(
            error.message || 'An unknown error occurred. Please try again.'
          );
          setStatus('error');
          toast({
            variant: 'destructive',
            title: 'Sign-in failed',
            description:
              error.message || 'An unknown error occurred during sign-in.',
          });
        }
      } else {
        setErrorMessage('This is not a valid sign-in link.');
        setStatus('error');
      }
    };

    signIn();
  }, [auth, router, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center">
       <Card className="w-full max-w-sm">
        <CardHeader>
            <CardTitle>
                {status === 'verifying' && 'Verifying Sign-In...'}
                {status === 'success' && 'Sign-In Successful!'}
                {status === 'error' && 'Sign-In Error'}
            </CardTitle>
            <CardDescription>
                {status === 'verifying' && 'Please wait while we verify your sign-in link.'}
                {status === 'success' && 'You will be redirected shortly.'}
                {status === 'error' && 'There was a problem signing you in.'}
            </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          {status === 'verifying' && (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          )}
          {status === 'success' && (
             <Loader2 className="h-12 w-12 animate-spin text-green-500" />
          )}
          {status === 'error' && (
            <p className="text-sm text-destructive text-center">{errorMessage}</p>
          )}
        </CardContent>
       </Card>
    </div>
  );
}
