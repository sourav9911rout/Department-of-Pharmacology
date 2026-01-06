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
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Skeleton } from "@/components/ui/skeleton";

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

    const handleStatusChange = (reqId: string, status: Requirement['status']) => {
        const docRef = doc(firestore, 'requirements', reqId);
        updateDocumentNonBlocking(docRef, { status });
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

    const getPriorityBadgeClass = (priority: Requirement['priorityLevel']) => {
        switch (priority) {
            case 'High': return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700';
            case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700';
            case 'Low': return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    }

    const getStatusBadgeClass = (status: Requirement['status']) => {
         switch (status) {
            case 'Procured': return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700';
            case 'Pending': return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700';
            case 'Partial': return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700';
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
                    <TableHead>Item Name</TableHead>
                    <TableHead>Required Quantity</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {isAdmin && <TableCell><Skeleton className="h-4 w-4" /></TableCell>}
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-28" /></TableCell>
                    </TableRow>
                  ))
                ) : data.map((req) => (
                    <TableRow key={req.id} data-state={selectedItems.includes(req.id) ? 'selected' : ''}>
                        {isAdmin && (
                            <TableCell>
                                <Checkbox
                                    checked={selectedItems.includes(req.id)}
                                    onCheckedChange={(checked) => handleSelect(req.id, !!checked)}
                                />
                            </TableCell>
                        )}
                        <TableCell className="font-medium">{req.name}</TableCell>
                        <TableCell>{req.requiredQuantity}</TableCell>
                        <TableCell>
                            <Badge variant="outline" className={cn("font-normal", getPriorityBadgeClass(req.priorityLevel))}>
                                {req.priorityLevel}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            {isAdmin ? (
                                <Select defaultValue={req.status} onValueChange={(value) => handleStatusChange(req.id, value as Requirement['status'])}>
                                    <SelectTrigger className="w-[120px] h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Partial">Partial</SelectItem>
                                        <SelectItem value="Procured">Procured</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Badge variant="outline" className={cn("font-normal", getStatusBadgeClass(req.status))}>
                                    {req.status}
                                </Badge>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
             {!isLoading && data.length === 0 && (
                <caption>
                    <div className="text-center text-muted-foreground p-8">
                        No requirements found.
                    </div>
                </caption>
            )}
        </div>
    );
}
