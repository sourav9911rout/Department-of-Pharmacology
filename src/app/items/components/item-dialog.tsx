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

type Document = { title: string; driveLink: string; };

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
  const [documents, setDocuments] = useState<Document[]>(item?.documents || []);
  
  const isEditing = !!item;
  
  useEffect(() => {
    if (open) {
      setCategory(item?.category);
      setInstallationStatus(item?.installationStatus);
      setDocuments(item?.documents || [{ title: '', driveLink: '' }]);
    }
  }, [open, item]);


  if (!isAdmin) {
    return null;
  }
  
  const handleDocumentChange = (index: number, field: keyof Document, value: string) => {
    const newDocuments = [...documents];
    newDocuments[index][field] = value;
    setDocuments(newDocuments);
  };
  
  const addDocumentField = () => {
    setDocuments([...documents, { title: '', driveLink: '' }]);
  };
  
  const removeDocumentField = (index: number) => {
    if (documents.length > 1) {
      const newDocuments = documents.filter((_, i) => i !== index);
      setDocuments(newDocuments);
    } else {
      // Clear the fields if it's the last one
      setDocuments([{ title: '', driveLink: '' }]);
    }
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Filter out empty documents before submitting
    const finalDocuments = documents.filter(doc => doc.title.trim() !== '' && doc.driveLink.trim() !== '');

    const newItemData: Omit<ProcuredItem, 'id'> = {
      name: formData.get('name') as string,
      category: category as ProcuredItem['category'],
      quantity: Number(formData.get('quantity')),
      dateOfProcurement: formData.get('dateOfProcurement') as string,
      installationStatus: installationStatus as ProcuredItem['installationStatus'],
      remarks: formData.get('remarks') as string,
      dateOfInstallation: installationStatus === 'Installed' ? (formData.get('dateOfInstallation') as string) : '',
      documents: finalDocuments,
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
              <Label htmlFor="remarks" className="text-right mt-2">
                Remarks
              </Label>
              <Textarea id="remarks" name="remarks" defaultValue={item?.remarks} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right mt-2">Documents</Label>
                <div className="col-span-3 space-y-4">
                    {documents.map((doc, index) => (
                        <div key={index} className="space-y-2 border p-3 rounded-md relative">
                            <Input 
                                placeholder="Document Title" 
                                value={doc.title}
                                onChange={(e) => handleDocumentChange(index, 'title', e.target.value)}
                                className="text-sm"
                            />
                            <Input 
                                placeholder="Google Drive Link"
                                value={doc.driveLink}
                                onChange={(e) => handleDocumentChange(index, 'driveLink', e.target.value)}
                                className="text-sm"
                            />
                             <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6"
                                onClick={() => removeDocumentField(index)}
                                >
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Remove Document</span>
                            </Button>
                        </div>
                    ))}
                     <Button type="button" variant="outline" size="sm" onClick={addDocumentField} className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Another Document
                    </Button>
                </div>
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
