'use client';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import type { TrashedItemDocument, ProcuredItem, Requirement, ClassMeeting, Sop } from "@/lib/types";
import { collection, doc, orderBy, query, deleteDoc, setDoc, getDoc } from "firebase/firestore";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { RotateCcw, Trash2 } from "lucide-react";

export default function RecycleBinPage() {
  const { isAdmin } = useAdminAuth();
  const firestore = useFirestore();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [itemToPermanentlyDelete, setItemToPermanentlyDelete] = useState<string | null>(null);

  const trashQuery = useMemoFirebase(
    () => query(collection(firestore, 'trash'), orderBy('deletedAt', 'desc')),
    [firestore]
  );
  const { data: trashedItems, isLoading } = useCollection<TrashedItemDocument>(trashQuery);

  const handleSelect = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedItems((trashedItems || []).map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleRestore = async (item: TrashedItemDocument) => {
    const originalDocRef = doc(firestore, item.originalCollection, item.originalId);
    await setDoc(originalDocRef, item.data);
    const trashDocRef = doc(firestore, 'trash', item.id);
    await deleteDoc(trashDocRef);
  };
  
  const handleBulkRestore = async () => {
    const itemsToRestore = trashedItems?.filter(item => selectedItems.includes(item.id)) || [];
    for (const item of itemsToRestore) {
        await handleRestore(item);
    }
    setSelectedItems([]);
  };

  const handlePermanentDelete = async () => {
    if (itemToPermanentlyDelete) {
      const trashDocRef = doc(firestore, 'trash', itemToPermanentlyDelete);
      await deleteDoc(trashDocRef);
      setItemToPermanentlyDelete(null);
    }
  };

  const getCollectionBadgeClass = (collectionName: string) => {
    switch (collectionName) {
      case 'procured_items': return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700';
      case 'requirements': return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700';
      case 'class_meetings': return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700';
      case 'sops': return 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/50 dark:text-pink-300 dark:border-pink-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  const isAllSelected = (trashedItems?.length || 0) > 0 && selectedItems.length === (trashedItems?.length || 0);
  const isSomeSelected = selectedItems.length > 0 && selectedItems.length < (trashedItems?.length || 0);

  const getItemName = (item: TrashedItemDocument) => {
    const data = item.data as any;
    return data.name || data.topic || 'Unknown';
  }


  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Recycle Bin"
        description="View and manage deleted items."
      >
        {isAdmin && selectedItems.length > 0 && (
            <Button onClick={handleBulkRestore}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Restore ({selectedItems.length})
            </Button>
        )}
      </PageHeader>
      
      {!isAdmin ? (
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                    <Checkbox
                        checked={isAllSelected || (isSomeSelected ? 'indeterminate' : false)}
                        onCheckedChange={handleSelectAll}
                        disabled={!trashedItems || trashedItems.length === 0}
                    />
                </TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Original Location</TableHead>
                <TableHead>Date Deleted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-32" /></TableCell>
                  </TableRow>
                ))
              ) : trashedItems && trashedItems.length > 0 ? (
                trashedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                        <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={(checked) => handleSelect(item.id, !!checked)}
                        />
                    </TableCell>
                    <TableCell className="font-medium">
                      {getItemName(item)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("font-normal", getCollectionBadgeClass(item.originalCollection))}>
                        {item.originalCollection.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(parseISO(item.deletedAt), "MMM d, yyyy 'at' p")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleRestore(item)}>
                        <RotateCcw className="mr-2 h-4 w-4"/> Restore
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setItemToPermanentlyDelete(item.id)}>
                        <Trash2 className="mr-2 h-4 w-4"/> Delete Permanently
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    The Recycle Bin is empty.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!itemToPermanentlyDelete} onOpenChange={(open) => !open && setItemToPermanentlyDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePermanentDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}