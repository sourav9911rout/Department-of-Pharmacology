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

export default function RequirementTable({ data }: { data: Requirement[] }) {
    const { isAdmin } = useAdminAuth();

    const getPriorityBadgeClass = (priority: Requirement['priority']) => {
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
                    <TableHead>Item Name</TableHead>
                    <TableHead>Required Quantity</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {data.map((req) => (
                    <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.name}</TableCell>
                        <TableCell>{req.requiredQuantity}</TableCell>
                        <TableCell>
                            <Badge variant="outline" className={cn("font-normal", getPriorityBadgeClass(req.priority))}>
                                {req.priority}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            {isAdmin ? (
                                <Select defaultValue={req.status}>
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
        </div>
    );
}
