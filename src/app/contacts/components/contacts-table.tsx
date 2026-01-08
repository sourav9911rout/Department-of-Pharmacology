
'use client';
import type { Contact } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ContactDialog } from "./contact-dialog";

export function ContactsTable({
  data,
  selectedItems,
  onSelectionChange,
  isLoading,
}: {
  data: Contact[];
  selectedItems: string[];
  onSelectionChange: (ids: string[]) => void;
  isLoading: boolean;
}) {
    const { isAdmin } = useAdminAuth();

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked === true) {
            onSelectionChange(data.map(item => item.id));
        } else {
            onSelectionChange([]);
        }
    }

    const handleSelect = (itemId: string, checked: boolean) => {
        if (checked) {
            onSelectionChange([...selectedItems, itemId]);
        } else {
            onSelectionChange(selectedItems.filter(id => id !== itemId));
        }
    }
    
    const isAllSelected = data.length > 0 && selectedItems.length === data.length;
    const isSomeSelected = selectedItems.length > 0 && selectedItems.length < data.length;

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                <TableRow>
                    {isAdmin && (
                        <TableHead className="w-[50px]">
                            <Checkbox
                                checked={isAllSelected || (isSomeSelected ? 'indeterminate' : false)}
                                onCheckedChange={handleSelectAll}
                            />
                        </TableHead>
                    )}
                    <TableHead className="w-[50px]">S.No.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email Address</TableHead>
                    {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
                </TableHeader>
                <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {isAdmin && <TableCell><Skeleton className="h-4 w-4" /></TableCell>}
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      {isAdmin && <TableCell className="text-right"><Skeleton className="h-8 w-16" /></TableCell>}
                    </TableRow>
                  ))
                ) : data.length > 0 ? (
                  data.map((item, index) => {
                    return (
                        <TableRow key={item.id} data-state={selectedItems.includes(item.id) ? 'selected' : ''}>
                        {isAdmin && (
                             <TableCell>
                                <Checkbox
                                    checked={selectedItems.includes(item.id)}
                                    onCheckedChange={(checked) => handleSelect(item.id, !!checked)}
                                />
                            </TableCell>
                        )}
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.email}</TableCell>
                        {isAdmin && (
                            <TableCell className="text-right">
                               <ContactDialog contact={item}>
                                   <Button variant="ghost" size="sm">Edit</Button>
                               </ContactDialog>
                            </TableCell>
                        )}
                        </TableRow>
                    )
                  })
                ) : (
                    <TableRow>
                        <TableCell colSpan={isAdmin ? 5 : 4} className="h-24 text-center">
                            No contacts found.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>
    );
}
