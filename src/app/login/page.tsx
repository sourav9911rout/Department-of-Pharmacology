
'use client';

import { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, ShieldCheck } from 'lucide-react';
import type { AppUser } from '@/lib/types';
import { sendSignInLinkToEmail } from 'firebase/auth';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';


export default function LoginPage() {
  const firestore = useFirestore();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const { toast } = useToast();

  const handleLoginRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore || !auth) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Services are not available. Please try again later.',
      });
      return;
    }
    setIsLoading(true);
    
    const actionCodeSettings = {
        url: `${BASE_URL}/auth`,
        handleCodeInApp: true,
    };

    if (email.toLowerCase() === ADMIN_EMAIL) {
      // Admin login flow
      try {
        window.localStorage.setItem('emailForSignIn', email);
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        setIsAdminLogin(true);
        toast({
            title: 'Admin Sign-In Link Sent',
            description: 'Please check your email for the sign-in link.',
        });
      } catch (error: any) {
        console.error('Error sending admin sign-in link:', error);
        toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: error.message || 'There was a problem sending the sign-in link.',
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // Regular user access request flow
      try {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const existingUser = querySnapshot.docs[0].data() as AppUser;
          if (existingUser.status === 'approved') {
            // If user is already approved, send them a sign-in link directly
            window.localStorage.setItem('emailForSignIn', email);
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            toast({
                title: 'Sign-In Link Sent',
                description: 'You are an approved user. Please check your email for the sign-in link.',
            });
          } else {
            // If user exists but is not approved
            toast({
                title: 'Request Already Submitted',
                description: `Your access request is currently in '${existingUser.status}' state.`,
            });
            setIsRequestSent(true);
          }
        } else {
          // If user does not exist, create a new request
          await addDoc(usersRef, {
            email: email,
            status: 'pending',
          });
          setIsRequestSent(true);
          toast({
            title: 'Request Sent for Approval',
            description: `Your request has been submitted. You will receive an email once the admin approves it.`,
          });
        }
      } catch (error: any) {
        console.error('Error submitting access request:', error);
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: error.message || 'There was a problem submitting your request.',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <form onSubmit={handleLoginRequest}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Department Portal
          </CardTitle>
          <CardDescription>
            {isRequestSent
              ? 'Your access request has been submitted.'
              : isAdminLogin 
              ? 'A sign-in link has been sent to your email.'
              : 'Enter your email to request access or sign in.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {isRequestSent ? (
            <div className="flex flex-col items-center justify-center text-center p-4 rounded-md bg-muted">
                <ShieldCheck className="w-12 h-12 text-primary mb-4" />
                <p className="font-semibold">Awaiting Approval</p>
                <p className="text-sm text-muted-foreground mt-1">
                    Once an administrator approves your request for <span className="font-medium text-foreground">{email}</span>, you will receive a sign-in link via email.
                </p>
            </div>
          ) : isAdminLogin ? (
             <div className="flex flex-col items-center justify-center text-center p-4 rounded-md bg-muted">
                <Mail className="w-12 h-12 text-primary mb-4" />
                <p className="font-semibold">Check Your Inbox</p>
                <p className="text-sm text-muted-foreground mt-1">
                    A secure sign-in link has been sent to <span className="font-medium text-foreground">{email}</span>. Please use it to log in.
                </p>
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}
        </CardContent>
        {!isRequestSent && !isAdminLogin && (
            <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Continue'}
                </Button>
            </CardFooter>
        )}
      </form>
    </Card>
  );
}
