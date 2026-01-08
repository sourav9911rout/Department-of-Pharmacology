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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import type { Requirement } from '@/lib/types';
import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection } from 'firebase/firestore';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2 } from 'lucide-react';

export function RequirementDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin } = useAdminAuth();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<Requirement['type'] | undefined>();
  const [documents, setDocuments] = useState([{ name: '', link: '' }]);
  
  if (!isAdmin) {
    return null;
  }
  
  const handleDocChange = (index: number, field: 'name' | 'link', value: string) => {
    const newDocs = [...documents];
    newDocs[index][field] = value;
    setDocuments(newDocs);
  };

  const addDocField = () => {
    setDocuments([...documents, { name: '', link: '' }]);
  };

  const removeDocField = (index: number) => {
    if (documents.length > 1) {
      const newDocs = documents.filter((_, i) => i !== index);
      setDocuments(newDocs);
    } else {
      // Clear the fields if it's the last one
      setDocuments([{ name: '', link: '' }]);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const filteredDocuments = documents.filter(doc => doc.name.trim() !== '' && doc.link.trim() !== '');

    const newRequirementData: Omit<Requirement, 'id' | 'status'> = {
      name: formData.get('name') as string,
      requiredQuantity: Number(formData.get('requiredQuantity')),
      type: type as Requirement['type'],
      remarks: formData.get('remarks') as string,
      documents: filteredDocuments,
    };

    const finalData = {
        ...newRequirementData,
        status: 'Pending' as Requirement['status'],
    }

    const collectionRef = collection(firestore, 'requirements');
    addDocumentNonBlocking(collectionRef, finalData);
    
    setOpen(false);
    // Reset form states
    setType(undefined);
    setDocuments([{ name: '', link: '' }]);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Requirement</DialogTitle>
            <DialogDescription>
              Fill in the details for the new requirement.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" name="name" className="col-span-3" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="requiredQuantity" className="text-right">
                Quantity
              </Label>
              <Input id="requiredQuantity" name="requiredQuantity" type="number" className="col-span-3" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select value={type} onValueChange={(v) => setType(v as Requirement['type'])} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Primary">Primary</SelectItem>
                  <SelectItem value="Secondary">Secondary</SelectItem>
                  <SelectItem value="Tertiary">Tertiary</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="documents" className="text-right mt-2">
                Documents
              </Label>
              <div className="col-span-3 space-y-2">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="Doc Name"
                      value={doc.name || ''}
                      onChange={(e) => handleDocChange(index, 'name', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Doc Link"
                      value={doc.link || ''}
                      onChange={(e) => handleDocChange(index, 'link', e.target.value)}
                      className="flex-1"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeDocField(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                 <Button type="button" variant="outline" size="sm" onClick={addDocField}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Document
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="remarks" className="text-right mt-2">
                Remarks
              </Label>
              <Textarea id="remarks" name="remarks" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Requirement</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
