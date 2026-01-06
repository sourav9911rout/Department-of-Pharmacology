
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useToast } from "@/hooks/use-toast";

const ADMIN_PIN = "743351"; // This should be in an environment variable in a real app

export default function AdminPinDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const { isAdmin, setIsAdmin } = useAdminAuth();
  const { toast } = useToast();

  const handleLogin = () => {
    if (pin === ADMIN_PIN) {
      setIsAdmin(true);
      toast({
        title: "Success",
        description: "Admin access granted.",
      });
      setOpen(false);
      setPin("");
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Incorrect PIN. Please try again.",
      });
      setPin("");
    }
  };
  
  const handleLogout = () => {
    setIsAdmin(false);
    toast({
      title: "Logged Out",
      description: "Admin access has been revoked.",
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isAdmin ? "Admin Controls" : "Admin Login"}</DialogTitle>
          <DialogDescription>
            {isAdmin ? "You currently have administrator privileges." : "Enter the secret PIN to get administrator access."}
          </DialogDescription>
        </DialogHeader>
        {isAdmin ? (
          <div className="py-4">
            <p>You can now add, edit, and delete content across the site.</p>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pin" className="text-right">
                PIN
              </Label>
              <Input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="col-span-3"
                maxLength={6}
              />
            </div>
          </div>
        )}
        <DialogFooter>
          {isAdmin ? (
             <Button type="button" variant="destructive" onClick={handleLogout}>Logout</Button>
          ) : (
            <Button type="button" onClick={handleLogin}>Login</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
