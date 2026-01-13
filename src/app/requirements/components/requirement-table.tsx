'use client';
import type { Requirement } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useFirestore } from "@/firebase";
import { collection, deleteDoc, doc } from "firebase/firestore";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCaption } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Link as LinkIcon } from "lucide-react";
import { RequirementDialog } from "./requirement-dialog";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export default function RequirementTable({
  data,
  selectedItems,
  onSelectionChange,
  isLoading
}: {
  data: Requirement[];
  selectedItems: string[];
  onSelectionChange: (ids: string[]) => void;
  isLoading: boolean;
}) {
    const { isAdmin } = useAdminAuth();
    const firestore = useFirestore();

    const handleStatusChange = (req: Requirement, status: Requirement['status']) => {
        if (!isAdmin) return;
        const docRef = doc(firestore, 'requirements', req.id);
        if (status === 'Procured') {
            const procuredItemsCollectionRef = collection(firestore, 'procured_items');
            addDocumentNonBlocking(procuredItemsCollectionRef, {
                name: req.name,
                quantity: req.requiredQuantity,
                dateOfProcurement: new Date().toISOString().split('T')[0],
                installationStatus: 'Pending',
                category: 'Miscellaneous', // Default category
                remarks: req.remarks || `Moved from requirement list.`,
                documents: req.documents || [],
            });
            deleteDoc(docRef);
        } else {
            updateDocumentNonBlocking(docRef, { status });
        }
    }

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

    const getStatusBadgeClass = (status: Requirement['status']) => {
         switch (status) {
            case 'Procured': return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700';
            case 'Pending': return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
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
                    <TableHead>Required Quantity</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>Status</TableHead>
                    {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
                </TableHeader>
                <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {isAdmin && <TableCell><Skeleton className="h-4 w-4" /></TableCell>}
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-28" /></TableCell>
                      {isAdmin && <TableCell className="text-right"><Skeleton className="h-8 w-16" /></TableCell>}
                    </TableRow>
                  ))
                ) : data.length > 0 ? (
                  data.map((req, index) => (
                    <TableRow key={req.id} data-state={selectedItems.includes(req.id) ? 'selected' : ''}>
                        {isAdmin && (
                            <TableCell>
                                <Checkbox
                                    checked={selectedItems.includes(req.id)}
                                    onCheckedChange={(checked) => handleSelect(req.id, !!checked)}
                                />
                            </TableCell>
                        )}
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium">{req.name}</TableCell>
                        <TableCell>{req.requiredQuantity}</TableCell>
                        <TableCell>
                            {req.documents && req.documents.length > 0 ? (
                                <div className="flex flex-col gap-1.5 items-start">
                                    {req.documents.map((doc, i) => (
                                        doc.name && doc.link ? (
                                            <Button key={i} variant="link" size="sm" asChild className="h-auto p-0 text-xs">
                                                <Link href={doc.link} target="_blank" rel="noopener noreferrer">
                                                    <LinkIcon className="mr-1.5 h-3 w-3"/>
                                                    {doc.name}
                                                </Link>
                                            </Button>
                                        ) : null
                                    ))}
                                </div>
                            ) : (
                                <span className="text-muted-foreground">N/A</span>
                            )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{req.remarks || 'N/A'}</TableCell>
                        <TableCell>
                            {isAdmin ? (
                                <Select defaultValue={req.status} onValueChange={(value) => handleStatusChange(req, value as Requirement['status'])}>
                                    <SelectTrigger className="w-[120px] h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Procured">Procured</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Badge variant="outline" className={cn("font-normal", getStatusBadgeClass(req.status))}>
                                    {req.status}
                                </Badge>
                            )}
                        </TableCell>
                        {isAdmin && (
                            <TableCell className="text-right">
                               <RequirementDialog requirement={req}>
                                   <Button variant="ghost" size="sm">Edit</Button>
                               </RequirementDialog>
                            </TableCell>
                        )}
                    </TableRow>
                  ))
                ) : (
                    null
                )}
                </TableBody>
                 { !isLoading && data.length === 0 && (
                    <TableCaption>No requirements found.</TableCaption>
                )}
            </Table>
        </div>
    );
}
