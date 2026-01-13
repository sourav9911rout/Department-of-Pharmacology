'use client';
import type { ProcuredItem } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ItemDialog } from "./item-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useCurrentUser } from "@/hooks/use-current-user";

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
    const { user } = useAdminAuth();
    const { currentUserData } = useCurrentUser(user?.email);
    const isAdmin = currentUserData?.role === 'admin';

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
                {isLoading ? (
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
                            {item.documents && item.documents.length > 0 ? (
                                <div className="flex flex-col gap-1.5 items-start">
                                    {item.documents.map((doc, i) => (
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
