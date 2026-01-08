
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
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';
import { PlusCircle, Trash2 } from 'lucide-react';

export function ItemDialog({
  children,
  item,
}: {
  children: React.ReactNode;
  item?: ProcuredItem;
}) {
  const { isAdmin } = useAdminAuth();
  const firestore = useFirestore();

  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(item?.category);
  const [installationStatus, setInstallationStatus] = useState(item?.installationStatus);
  const [documents, setDocuments] = useState(item?.documents || [{ name: '', link: '' }]);
  
  const isEditing = !!item;
  
  useEffect(() => {
    if (open) {
      setCategory(item?.category);
      setInstallationStatus(item?.installationStatus);
      setDocuments(item?.documents && item.documents.length > 0 ? item.documents : [{ name: '', link: '' }]);
    }
  }, [open, item]);


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
    
    const newItemData = {
      name: formData.get('name') as string,
      category: category as ProcuredItem['category'],
      quantity: Number(formData.get('quantity')),
      dateOfProcurement: formData.get('dateOfProcurement') as string,
      installationStatus: installationStatus as ProcuredItem['installationStatus'],
      remarks: formData.get('remarks') as string,
      dateOfInstallation: installationStatus === 'Installed' ? (formData.get('dateOfInstallation') as string) : undefined,
      documents: filteredDocuments,
    };

    if (isEditing && item) {
      const docRef = doc(firestore, 'procured_items', item.id);
      setDocumentNonBlocking(docRef, newItemData, { merge: true });
    } else {
      const collectionRef = collection(firestore, 'procured_items');
      addDocumentNonBlocking(collectionRef, newItemData);
    }
    
    setOpen(false);
  };
  

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Item' : 'Add New Item'}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update the details of the existing item." : "Fill in the details for the new item."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" name="name" defaultValue={item?.name} className="col-span-3" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory} required>
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
              <Input id="quantity" name="quantity" type="number" defaultValue={item?.quantity} className="col-span-3" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dateOfProcurement" className="text-right">
                Date
              </Label>
              <Input id="dateOfProcurement" name="dateOfProcurement" type="date" defaultValue={item?.dateOfProcurement} className="col-span-3" required/>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="installationStatus" className="text-right">
                Status
              </Label>
              <Select value={installationStatus} onValueChange={setInstallationStatus}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Installed">Installed</SelectItem>
                  <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {installationStatus === 'Installed' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dateOfInstallation" className="text-right">
                  Installation Date
                </Label>
                <Input id="dateOfInstallation" name="dateOfInstallation" type="date" defaultValue={item?.dateOfInstallation} className="col-span-3" required/>
              </div>
            )}
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
              <Textarea id="remarks" name="remarks" defaultValue={item?.remarks} className="col-span-3" />
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
