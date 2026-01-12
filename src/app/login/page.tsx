
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { sendLoginCode } from '@/ai/flows/send-login-code';
import { verifyLoginCode } from '@/ai/flows/verify-login-code';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleLoginRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await sendLoginCode({ email });
      if (result.success) {
        setCodeSent(true);
        toast({
          title: "Check your email",
          description: result.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Login request error:", error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: error instanceof Error ? error.message : 'Could not send login code. Please try again.',
      });
    }
    setIsLoading(false);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await verifyLoginCode({ email, code });
      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        // On successful verification, redirect to the auth callback page
        router.push(`/auth?email=${encodeURIComponent(email)}`);
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: result.message,
        });
      }
    } catch (error) {
       console.error("Code verification error:", error);
       toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error instanceof Error ? error.message : 'Could not verify your code. Please try again.',
      });
    }
    setIsLoading(false);
  };


  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Dept. of Pharmacology</CardTitle>
          <CardDescription>AIIMS CAPFIMS Portal</CardDescription>
        </CardHeader>
        <CardContent>
          {!codeSent ? (
            <form onSubmit={handleLoginRequest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Login Code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <p className="text-sm text-center text-muted-foreground">
                A 6-digit code was sent to <span className="font-semibold">{email}</span>.
              </p>
              <div className="space-y-2">
                <Label htmlFor="code">Login Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter the 6-digit code"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isLoading}
                  maxLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
                {isLoading ? 'Verifying...' : 'Login'}
              </Button>
               <Button variant="link" size="sm" className="w-full" onClick={() => setCodeSent(false)} disabled={isLoading}>
                Use a different email
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
