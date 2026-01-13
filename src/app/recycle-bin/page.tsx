
'use client';
import { useState } from 'react';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, writeBatch, deleteDoc } from 'firebase/firestore';
import type { TrashedItem } from '@/lib/types';
import TrashTable from './components/trash-table';
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
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RecycleBinPage() {
  const { isAdmin } = useAdminAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const trashQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'trash'), orderBy('deletedAt', 'desc'));
  }, [firestore]);

  const { data: trashedItems, isLoading } = useCollection<TrashedItem>(trashQuery);

  const handleRestore = async () => {
    if (!firestore || !isAdmin || selectedItems.length === 0) return;

    const batch = writeBatch(firestore);
    const itemsToRestore = trashedItems?.filter(item => selectedItems.includes(item.id)) || [];

    itemsToRestore.forEach(item => {
      const originalDocRef = doc(firestore, item.originalCollection, item.originalId);
      const trashDocRef = doc(firestore, 'trash', item.id);
      
      batch.set(originalDocRef, item.data);
      batch.delete(trashDocRef);
    });

    await batch.commit();

    toast({
      title: `${selectedItems.length} item(s) restored`,
      description: 'The items have been moved back to their original location.',
    });

    setSelectedItems([]);
  };

  const handleDeletePermanently = async () => {
    if (!firestore || !isAdmin) return;

    const batch = writeBatch(firestore);
    selectedItems.forEach(id => {
      const trashDocRef = doc(firestore, 'trash', id);
      batch.delete(trashDocRef);
    });

    await batch.commit();
    
    toast({
      variant: 'destructive',
      title: 'Items permanently deleted',
      description: 'The selected items have been removed forever.',
    });

    setSelectedItems([]);
    setIsDeleteDialogOpen(false);
  };
  
  if (!isAdmin) {
    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="Access Denied" description="You must be an admin to view this page." />
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Recycle Bin"
        description="Manage items that have been deleted. You can restore them or delete them permanently."
      >
        {selectedItems.length > 0 && (
          <div className="flex items-center gap-2">
            <Button onClick={handleRestore}>Restore ({selectedItems.length})</Button>
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Permanently ({selectedItems.length})
            </Button>
          </div>
        )}
      </PageHeader>

      <TrashTable
        data={trashedItems || []}
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
        isLoading={isLoading}
      />
      
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the selected item(s) from the recycle bin.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeletePermanently} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete Permanently
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
