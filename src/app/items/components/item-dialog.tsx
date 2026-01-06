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
import type { ProcuredItem, DocumentLink } from '@/lib/types';
import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ItemDialog({
  children,
  item,
}: {
  children: React.ReactNode;
  item?: ProcuredItem;
}) {
  const { isAdmin } = useAdminAuth();
  const firestore = useFirestore();

  const documentsCollection = useMemoFirebase(() => collection(firestore, 'documents'), [firestore]);
  const { data: allDocuments } = useCollection<DocumentLink>(documentsCollection);

  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(item?.category);
  const [installationStatus, setInstallationStatus] = useState(item?.installationStatus);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>(item?.documentIds || []);
  const [popoverOpen, setPopoverOpen] = useState(false);
  
  const isEditing = !!item;

  if (!isAdmin) {
    return null;
  }
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newItemData: Omit<ProcuredItem, 'id'> = {
      name: formData.get('name') as string,
      category: category as ProcuredItem['category'],
      quantity: Number(formData.get('quantity')),
      dateOfProcurement: formData.get('dateOfProcurement') as string,
      installationStatus: installationStatus as ProcuredItem['installationStatus'],
      remarks: formData.get('remarks') as string,
      dateOfInstallation: installationStatus === 'Installed' ? (formData.get('dateOfInstallation') as string) : '',
      documentIds: selectedDocumentIds,
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
  
  const selectedDocuments = allDocuments?.filter(doc => selectedDocumentIds.includes(doc.id)) || [];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        // Reset state on close
        setCategory(item?.category);
        setInstallationStatus(item?.installationStatus);
        setSelectedDocumentIds(item?.documentIds || []);
      }
    }}>
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
              <div className="col-span-3">
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={popoverOpen}
                      className="w-full justify-between h-auto min-h-10"
                    >
                       <div className="flex gap-1 flex-wrap">
                        {selectedDocuments.length > 0 ? selectedDocuments.map(doc => (
                          <Badge
                            variant="secondary"
                            key={doc.id}
                            className="mr-1"
                          >
                            {doc.title}
                          </Badge>
                        )) : "Select documents..."}
                       </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                     <Command>
                        <CommandInput placeholder="Search documents..." />
                        <CommandList>
                            <CommandEmpty>No documents found.</CommandEmpty>
                            <CommandGroup>
                            {(allDocuments || []).map((doc) => (
                                <CommandItem
                                key={doc.id}
                                value={doc.title}
                                onSelect={() => {
                                    setSelectedDocumentIds(current => 
                                    current.includes(doc.id) 
                                        ? current.filter(id => id !== doc.id)
                                        : [...current, doc.id]
                                    );
                                }}
                                >
                                <Check
                                    className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedDocumentIds.includes(doc.id) ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {doc.title}
                                </CommandItem>
                            ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
