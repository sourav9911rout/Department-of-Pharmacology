'use client';
import type { DocumentLink, ProcuredItem } from "@/lib/types";
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
import { ItemDialog } from "./item-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import Link from "next/link";

export default function ItemTable({
  data,
  selectedItems,
  onSelectionChange,
  isLoading,
}: {
  data: ProcuredItem[];
  selectedItems: string[];
  onSelectionChange: (ids: string[]) => void;
  isLoading: boolean;
}) {
    const { isAdmin } = useAdminAuth();
    const firestore = useFirestore();
    const documentsCollection = useMemoFirebase(() => collection(firestore, 'documents'), [firestore]);
    const { data: allDocuments } = useCollection<DocumentLink>(documentsCollection);

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

    const getStatusBadgeClass = (status: ProcuredItem['installationStatus']) => {
        switch (status) {
            case 'Installed': return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700';
            case 'Pending': return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700';
            default: return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/50 dark:text-gray-300 dark:border-gray-700';
        }
    }
    
    const getDocumentsForItem = (item: ProcuredItem) => {
        if (!item.documentIds || !allDocuments) return [];
        return allDocuments.filter(doc => item.documentIds?.includes(doc.id));
    }

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
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Procurement Date</TableHead>
                    <TableHead>Installation Status</TableHead>
                    <TableHead>Installation Date</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Remarks</TableHead>
                    {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
                </TableHeader>
                <TableBody>
                {isLoading || !allDocuments ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {isAdmin && <TableCell><Skeleton className="h-4 w-4" /></TableCell>}
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      {isAdmin && <TableCell className="text-right"><Skeleton className="h-8 w-16" /></TableCell>}
                    </TableRow>
                  ))
                ) : data.length > 0 ? (
                  data.map((item, index) => {
                    const linkedDocuments = getDocumentsForItem(item);
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
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.dateOfProcurement}</TableCell>
                        <TableCell>
                            <Badge variant="outline" className={cn("font-normal", getStatusBadgeClass(item.installationStatus))}>
                                {item.installationStatus || 'N/A'}
                            </Badge>
                        </TableCell>
                        <TableCell>{item.dateOfInstallation || 'N/A'}</TableCell>
                         <TableCell>
                            <div className="flex flex-wrap gap-1">
                                {linkedDocuments.length > 0 ? linkedDocuments.map(doc => (
                                    <Button asChild variant="link" size="sm" className="p-0 h-auto" key={doc.id}>
                                        <Link href={doc.driveLink} target="_blank" rel="noopener noreferrer">
                                            <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20">{doc.title}</Badge>
                                        </Link>
                                    </Button>
                                )) : <span className="text-muted-foreground">N/A</span>}
                            </div>
                         </TableCell>
                        <TableCell className="text-muted-foreground">{item.remarks || 'N/A'}</TableCell>
                        {isAdmin && (
                            <TableCell className="text-right">
                               <ItemDialog item={item}>
                                   <Button variant="ghost" size="sm">Edit</Button>
                               </ItemDialog>
                            </TableCell>
                        )}
                        </TableRow>
                    )
                  })
                ) : (
                    <TableRow>
                        <TableCell colSpan={isAdmin ? 11 : 10} className="h-24 text-center">
                            No procured items found.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>
    );
}
