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

export function RequirementDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin } = useAdminAuth();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<Requirement['type'] | undefined>();
  const [priorityLevel, setPriorityLevel] = useState<Requirement['priorityLevel'] | undefined>();
  
  if (!isAdmin) {
    return null;
  }
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newRequirementData: Omit<Requirement, 'id' | 'status'> = {
      name: formData.get('name') as string,
      requiredQuantity: Number(formData.get('requiredQuantity')),
      type: type as Requirement['type'],
      priorityLevel: priorityLevel as Requirement['priorityLevel'],
    };

    const finalData = {
        ...newRequirementData,
        status: 'Pending' as Requirement['status'],
    }

    const collectionRef = collection(firestore, 'requirements');
    addDocumentNonBlocking(collectionRef, finalData);
    
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Requirement</DialogTitle>
            <DialogDescription>
              Fill in the details for the new requirement.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priorityLevel" className="text-right">
                Priority
              </Label>
              <Select value={priorityLevel} onValueChange={(v) => setPriorityLevel(v as Requirement['priorityLevel'])} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select priority level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
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
