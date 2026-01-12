
'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
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

export default function LoginPage() {
  const firestore = useFirestore();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const { toast } = useToast();

  const handleLoginRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Database service is not available. Please try again later.',
      });
      return;
    }
    setIsLoading(true);

    try {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // User already exists
        const existingUser = querySnapshot.docs[0].data() as AppUser;
        toast({
          title: 'Request Already Submitted',
          description: `Your access request with email ${email} is currently in '${existingUser.status}' state.`,
        });
        setIsRequestSent(true);
      } else {
        // New user, add to pending list
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
        description:
          error.message || 'There was a problem submitting your request.',
      });
    } finally {
      setIsLoading(false);
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
        {!isRequestSent && (
            <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Request Access'}
                </Button>
            </CardFooter>
        )}
      </form>
    </Card>
  );
}
