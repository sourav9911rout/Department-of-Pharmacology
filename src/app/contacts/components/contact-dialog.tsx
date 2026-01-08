
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
import type { Contact } from '@/lib/types';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';

export function ContactDialog({
  children,
  contact,
  onOpenChange,
}: {
  children: React.ReactNode;
  contact?: Contact;
  onOpenChange?: (open: boolean) => void;
}) {
  const { isAdmin } = useAdminAuth();
  const firestore = useFirestore();

  const [open, setOpen] = useState(false);
  
  const isEditing = !!contact;
  
  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(open);
    }
  }, [open, onOpenChange]);


  if (!isAdmin) {
    return null;
  }
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newContactData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      designation: formData.get('designation') as string,
    };

    if (isEditing && contact) {
      const docRef = doc(firestore, 'contacts', contact.id);
      setDocumentNonBlocking(docRef, newContactData, { merge: true });
    } else {
      const collectionRef = collection(firestore, 'contacts');
      addDocumentNonBlocking(collectionRef, newContactData);
    }
    
    setOpen(false);
  };
  

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update the contact's details." : "Fill in the details for the new contact."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" name="name" defaultValue={contact?.name} className="col-span-3" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
               <Input id="email" name="email" type="email" defaultValue={contact?.email} className="col-span-3" required/>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="designation" className="text-right">
                Designation
              </Label>
              <Input id="designation" name="designation" defaultValue={contact?.designation} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{isEditing ? 'Save Changes' : 'Add Contact'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
