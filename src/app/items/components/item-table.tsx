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
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { ItemDialog } from "./item-dialog";
import { Checkbox } from "@/components/ui/checkbox";

export default function ItemTable({
  data,
  selectedItems,
  onSelectionChange,
}: {
  data: ProcuredItem[];
  selectedItems: string[];
  onSelectionChange: (ids: string[]) => void;
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
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Procurement Date</TableHead>
                    <TableHead>Remarks</TableHead>
                    {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
                </TableHeader>
                <TableBody>
                {data.map((item) => (
                    <TableRow key={item.id} data-state={selectedItems.includes(item.id) ? 'selected' : ''}>
                    {isAdmin && (
                         <TableCell>
                            <Checkbox
                                checked={selectedItems.includes(item.id)}
                                onCheckedChange={(checked) => handleSelect(item.id, !!checked)}
                            />
                        </TableCell>
                    )}
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.procurementDate}</TableCell>
                    <TableCell className="text-muted-foreground">{item.remarks || 'N/A'}</TableCell>
                    {isAdmin && (
                        <TableCell className="text-right">
                           <ItemDialog item={item}>
                               <Button variant="ghost" size="sm">Edit</Button>
                           </ItemDialog>
                        </TableCell>
                    )}
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            {data.length === 0 && (
                <caption>
                    <div className="text-center text-muted-foreground p-8">
                        No procured items found.
                    </div>
                </caption>
            )}
        </div>
    );
}
