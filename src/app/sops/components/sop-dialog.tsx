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
import { useAdminAuth } from '@/hooks/use-admin-auth';
import type { Sop } from '@/lib/types';
import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';

export function SopDialog({
  children,
  sop,
}: {
  children: React.ReactNode;
  sop?: Sop;
}) {
  const { isAdmin } = useAdminAuth();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);
  const isEditing = !!sop;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newSopData = {
      title: formData.get('title') as string,
      driveLink: formData.get('driveLink') as string,
    };
    
    if (isEditing && sop) {
      const docRef = doc(firestore, 'sops', sop.id);
      setDocumentNonBlocking(docRef, newSopData, { merge: true });
    } else {
      const collectionRef = collection(firestore, 'sops');
      addDocumentNonBlocking(collectionRef, newSopData);
    }
    
    setOpen(false);
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
            <DialogTitle>{isEditing ? 'Edit SOP' : 'Add New SOP'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the details of the SOP.' : 'Fill in the details for the new SOP.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input id="title" name="title" defaultValue={sop?.title} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="driveLink" className="text-right">
                Drive Link
              </Label>
              <Input id="driveLink" name="driveLink" defaultValue={sop?.driveLink} className="col-span-3" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{isEditing ? 'Save Changes' : 'Add SOP'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
