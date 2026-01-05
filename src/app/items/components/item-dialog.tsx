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
import { Textarea } from '@/components/ui/textarea';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import type { ProcuredItem } from '@/lib/types';
import { useState } from 'react';

export function ItemDialog({
  children,
  item,
}: {
  children: React.ReactNode;
  item?: ProcuredItem;
}) {
  const { isAdmin } = useAdminAuth();
  const [open, setOpen] = useState(false);
  const isEditing = !!item;

  if (!isAdmin) {
    return null;
  }
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In a real app, you would handle form submission here.
    // For example, calling a server action.
    console.log('Form submitted');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Item' : 'Add New Item'}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update the details of the existing item." : "Fill in the details for the new item."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" defaultValue={item?.name} className="col-span-3" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select defaultValue={item?.category}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Furniture">Furniture</SelectItem>
                  <SelectItem value="Stationery">Stationery</SelectItem>
                  <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input id="quantity" type="number" defaultValue={item?.quantity} className="col-span-3" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="procurementDate" className="text-right">
                Date
              </Label>
              <Input id="procurementDate" type="date" defaultValue={item?.procurementDate} className="col-span-3" required/>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="remarks" className="text-right mt-2">
                Remarks
              </Label>
              <Textarea id="remarks" defaultValue={item?.remarks} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{isEditing ? 'Save Changes' : 'Add Item'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
