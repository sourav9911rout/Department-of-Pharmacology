
'use client';
import { useState, useMemo } from "react";
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
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc, updateDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";
import type { TrashedItem, ProcuredItem, Requirement, ClassMeeting, Sop } from "@/lib/types";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type CollectionName = 'procured_items' | 'requirements' | 'class_meetings' | 'sops';

const collectionTypeMapping: Record<CollectionName, string> = {
  procured_items: 'Procured Item',
  requirements: 'Requirement',
  class_meetings: 'Class/Meeting',
  sops: 'SOP',
};

export default function TrashPage() {
  const { isAdmin } = useAdminAuth();
  const firestore = useFirestore();

  const [itemToRestore, setItemToRestore] = useState<TrashedItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<TrashedItem | null>(null);

  const trashedProcuredItemsQuery = useMemoFirebase(() => query(collection(firestore, 'procured_items'), where('deleted', '==', true)), [firestore]);
  const { data: trashedProcuredItems, isLoading: loadingProcured } = useCollection<ProcuredItem>(trashedProcuredItemsQuery);

  const trashedRequirementsQuery = useMemoFirebase(() => query(collection(firestore, 'requirements'), where('deleted', '==', true)), [firestore]);
  const { data: trashedRequirements, isLoading: loadingReqs } = useCollection<Requirement>(trashedRequirementsQuery);

  const trashedMeetingsQuery = useMemoFirebase(() => query(collection(firestore, 'class_meetings'), where('deleted', '==', true)), [firestore]);
  const { data: trashedMeetings, isLoading: loadingMeetings } = useCollection<ClassMeeting>(trashedMeetingsQuery);
  
  const trashedSopsQuery = useMemoFirebase(() => query(collection(firestore, 'sops'), where('deleted', '==', true)), [firestore]);
  const { data: trashedSops, isLoading: loadingSops } = useCollection<Sop>(trashedSopsQuery);

  const allTrashedItems = useMemo<TrashedItem[]>(() => {
    const procured = trashedProcuredItems?.map(item => ({ ...item, originalCollection: 'procured_items' as const })) || [];
    const reqs = trashedRequirements?.map(item => ({ ...item, originalCollection: 'requirements' as const })) || [];
    const meetings = trashedMeetings?.map(item => ({ ...item, originalCollection: 'class_meetings' as const })) || [];
    const sops = trashedSops?.map(item => ({ ...item, originalCollection: 'sops' as const })) || [];
    
    const combined = [...procured, ...reqs, ...meetings, ...sops];
    return combined.sort((a, b) => new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime());
  }, [trashedProcuredItems, trashedRequirements, trashedMeetings, trashedSops]);

  const isLoading = loadingProcured || loadingReqs || loadingMeetings || loadingSops;

  const handleRestore = () => {
    if (!itemToRestore) return;
    const docRef = doc(firestore, itemToRestore.originalCollection, itemToRestore.id);
    updateDoc(docRef, { deleted: false, deletedAt: null });
    setItemToRestore(null);
  };

  const handleDeletePermanent = () => {
    if (!itemToDelete) return;
    const docRef = doc(firestore, itemToDelete.originalCollection, itemToDelete.id);
    deleteDoc(docRef);
    setItemToDelete(null);
  };

  if (!isAdmin) {
    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Trash"
                description="This page is only available to administrators."
            />
        </div>
    )
  }

  const getItemName = (item: TrashedItem) => {
    if ('topic' in item) return item.topic;
    return item.name;
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Trash"
        description="View and manage recently deleted items."
      />

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Deleted On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="text-right flex gap-2 justify-end">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </TableCell>
                </TableRow>
              ))
            ) : allTrashedItems.length > 0 ? (
              allTrashedItems.map((item) => (
                <TableRow key={`${item.originalCollection}-${item.id}`}>
                  <TableCell className="font-medium">{getItemName(item)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{collectionTypeMapping[item.originalCollection]}</Badge>
                  </TableCell>
                  <TableCell>{item.deletedAt ? format(new Date(item.deletedAt), "PPpp") : 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setItemToRestore(item)}>
                      Restore
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setItemToDelete(item)}>
                      Delete Permanently
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  The trash is empty.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Restore Dialog */}
      <AlertDialog open={!!itemToRestore} onOpenChange={(open) => !open && setItemToRestore(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the item to its original list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToRestore(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>Restore</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent Delete Dialog */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePermanent} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
