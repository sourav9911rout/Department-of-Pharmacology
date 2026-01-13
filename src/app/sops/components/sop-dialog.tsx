'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Sop } from '@/lib/types';
import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection } from 'firebase/firestore';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { useCurrentUser } from '@/hooks/use-current-user';

export function SopDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAdminAuth();
  const { currentUserData } = useCurrentUser(user?.email);
  const isAdmin = currentUserData?.role === 'admin';
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newSopData: Omit<Sop, 'id'> = {
      name: formData.get('name') as string,
      driveLink: formData.get('driveLink') as string,
    };

    const collectionRef = collection(firestore, 'sops');
    addDocumentNonBlocking(collectionRef, newSopData);
    
    setOpen(false);
    (e.target as HTMLFormElement).reset();
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New SOP</DialogTitle>
            <DialogDescription>
              Enter the name and Google Drive link for the new SOP.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" name="name" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="driveLink" className="text-right">
                Drive Link
              </Label>
              <Input id="driveLink" name="driveLink" className="col-span-3" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add SOP</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
