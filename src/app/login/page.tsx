'use client';

import { useState } from 'react';
import { useAuth } from '@/firebase';
import { sendSignInLinkToEmail } from 'firebase/auth';
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
import { Mail } from 'lucide-react';

export default function LoginPage() {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLinkSent, setIsLinkSent] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const actionCodeSettings = {
      url: `${window.location.origin}/auth`,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setIsLinkSent(true);
      toast({
        title: 'Check your email',
        description: `A sign-in link has been sent to ${email}.`,
      });
    } catch (error: any) {
      console.error('Error sending sign-in link:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description:
          error.message || 'There was a problem sending the sign-in link.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <form onSubmit={handleLogin}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Department Portal
          </CardTitle>
          <CardDescription>
            {isLinkSent
              ? 'A sign-in link has been sent to your email.'
              : 'Enter your email to sign in.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {isLinkSent ? (
            <div className="flex flex-col items-center justify-center text-center p-4 rounded-md bg-muted">
                <Mail className="w-12 h-12 text-primary mb-4" />
                <p className="font-semibold">Check your inbox</p>
                <p className="text-sm text-muted-foreground mt-1">
                    Follow the link we sent to <span className="font-medium text-foreground">{email}</span> to complete your sign-in.
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
        {!isLinkSent && (
            <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending Link...' : 'Send Sign-In Link'}
                </Button>
            </CardFooter>
        )}
      </form>
    </Card>
  );
}
