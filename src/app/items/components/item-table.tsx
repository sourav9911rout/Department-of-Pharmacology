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
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { ItemDialog } from "./item-dialog";

export default function ItemTable({ data }: { data: ProcuredItem[] }) {
    const { isAdmin } = useAdminAuth();

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                <TableRow>
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
                    <TableRow key={item.id}>
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
        </div>
    );
}
