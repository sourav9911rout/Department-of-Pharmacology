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
import { Textarea } from '@/components/ui/textarea';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import type { DocumentLink } from '@/lib/types';
import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';

export function DocumentDialog({
  children,
  document,
  onSave,
}: {
  children: React.ReactNode;
  document?: DocumentLink;
  onSave: (document: Omit<DocumentLink, 'id'>) => void;
}) {
  const { isAdmin } = useAdminAuth();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);
  const isEditing = !!document;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newDocumentData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      driveLink: formData.get('driveLink') as string,
    };

    if (isEditing && document) {
      const docRef = doc(firestore, 'documents', document.id);
      setDocumentNonBlocking(docRef, newDocumentData, { merge: true });
    } else {
      const collectionRef = collection(firestore, 'documents');
      addDocumentNonBlocking(collectionRef, newDocumentData);
    }
    
    onSave(newDocumentData);
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
            <DialogTitle>{isEditing ? 'Edit Document' : 'Add New Document'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the details of the document.' : 'Fill in the details for the new document link.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input id="title" name="title" defaultValue={document?.title} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right mt-2">
                Description
              </Label>
              <Textarea id="description" name="description" defaultValue={document?.description} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="driveLink" className="text-right">
                Drive Link
              </Label>
              <Input id="driveLink" name="driveLink" defaultValue={document?.driveLink} className="col-span-3" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{isEditing ? 'Save Changes' : 'Add Document'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
