
'use client';
import type { TrashedItem } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';
import { Timestamp } from "firebase/firestore";

function formatDate(timestamp: Timestamp | undefined) {
    if (!timestamp) return 'N/A';
    return format(timestamp.toDate(), 'PPpp');
}

function getOriginalCollectionName(collectionId: string) {
    switch(collectionId) {
        case 'procured_items': return 'Procured Item';
        case 'requirements': return 'Requirement';
        case 'class_meetings': return 'Class/Meeting';
        case 'sops': return 'SOP';
        default: return 'Item';
    }
}


export default function TrashTable({
  data,
  selectedItems,
  onSelectionChange,
  isLoading,
}: {
  data: TrashedItem[];
  selectedItems: string[];
  onSelectionChange: (ids: string[]) => void;
  isLoading: boolean;
}) {

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
                    <TableHead className="w-[50px]">
                        <Checkbox
                            checked={isAllSelected || (isSomeSelected ? 'indeterminate' : false)}
                            onCheckedChange={handleSelectAll}
                        />
                    </TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Original Type</TableHead>
                    <TableHead>Date Deleted</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    </TableRow>
                  ))
                ) : data.length > 0 ? (
                  data.map((item) => {
                    return (
                        <TableRow key={item.id} data-state={selectedItems.includes(item.id) ? 'selected' : ''}>
                             <TableCell>
                                <Checkbox
                                    checked={selectedItems.includes(item.id)}
                                    onCheckedChange={(checked) => handleSelect(item.id, !!checked)}
                                />
                            </TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{getOriginalCollectionName(item.originalCollection)}</TableCell>
                        <TableCell>{formatDate(item.deletedAt)}</TableCell>
                        </TableRow>
                    )
                  })
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            The recycle bin is empty.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>
    );
}
