
'use client';

import { useState } from 'react';
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
import { Mail, ShieldCheck, KeyRound } from 'lucide-react';
import { sendLoginCode } from '@/ai/flows/send-login-code';
import { verifyLoginCode } from '@/ai/flows/verify-login-code';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uiState, setUiState] = useState<'enter-email' | 'enter-code' | 'request-sent'>('enter-email');
  const { login } = useAdminAuth();
  const { toast } = useToast();
  const router = useRouter();


  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { canLogin, message } = await sendLoginCode({ email });
      toast({ title: message });
      if (canLogin) {
        setUiState('enter-code');
      } else {
        setUiState('request-sent');
      }
    } catch (error: any) {
      console.error('Error requesting login code:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'There was a problem requesting a login code.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { success, isAdmin, message } = await verifyLoginCode({ email, code });
      if (success) {
        login(email, isAdmin);
        toast({
          title: 'Successfully signed in!',
          description: 'Redirecting you to the dashboard...',
        });
        router.push('/');
      } else {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: message,
        });
      }
    } catch (error: any) {
        console.error('Error verifying login code:', error);
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: error.message || 'There was a problem verifying your code.',
        });
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Department Portal
          </CardTitle>
          <CardDescription>
            {uiState === 'enter-email' && 'Enter your email to request access or sign in.'}
            {uiState === 'enter-code' && `A code has been sent to ${email}.`}
            {uiState === 'request-sent' && 'Your access request has been submitted.'}
          </CardDescription>
        </CardHeader>
        
        {uiState === 'enter-email' && (
             <form onSubmit={handleEmailSubmit}>
                <CardContent className="grid gap-4">
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
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Continue'}
                    </Button>
                </CardFooter>
            </form>
        )}

        {uiState === 'enter-code' && (
            <form onSubmit={handleCodeSubmit}>
                <CardContent className="grid gap-4">
                    <div className="flex flex-col items-center justify-center text-center p-4 rounded-md bg-muted">
                        <KeyRound className="w-12 h-12 text-primary mb-4" />
                        <p className="font-semibold">Enter Your Code</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Check your inbox for a 6-digit code.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="code">Login Code</Label>
                        <Input
                            id="code"
                            type="text"
                            placeholder="123456"
                            required
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            disabled={isLoading}
                            maxLength={6}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Verifying...' : 'Sign In'}
                    </Button>
                     <Button variant="link" size="sm" onClick={() => { setUiState('enter-email'); setCode(''); }}>
                        Use a different email
                    </Button>
                </CardFooter>
            </form>
        )}

        {uiState === 'request-sent' && (
            <CardContent>
                 <div className="flex flex-col items-center justify-center text-center p-4 rounded-md bg-muted">
                    <ShieldCheck className="w-12 h-12 text-primary mb-4" />
                    <p className="font-semibold">Awaiting Approval</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Once an administrator approves your request for <span className="font-medium text-foreground">{email}</span>, you will be able to log in.
                    </p>
                </div>
            </CardContent>
        )}
    </Card>
  );
}
