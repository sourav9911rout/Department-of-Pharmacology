'use client';
import PageHeader from "@/components/page-header";
import ItemTable from "./components/item-table";
import { ItemDialog } from "./components/item-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ProcuredItem } from "@/lib/types";
import { useAdminAuth } from "@/hooks/use-admin-auth";
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
import { collection, deleteDoc, doc } from "firebase/firestore";

export default function ProcuredItemsPage() {
  const { isAdmin } = useAdminAuth();
  const firestore = useFirestore();
  const procuredItemsCollection = useMemoFirebase(
    () => collection(firestore, 'procured_items'),
    [firestore]
  );
  const { data: items, isLoading } = useCollection<ProcuredItem>(procuredItemsCollection);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    selectedItems.forEach(itemId => {
      const docRef = doc(firestore, 'procured_items', itemId);
      deleteDoc(docRef);
    });
    setSelectedItems([]);
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Procured Items"
        description="Track all items procured by the department."
      >
        <div className="flex items-center gap-2">
          {isAdmin && selectedItems.length > 0 && (
              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete ({selectedItems.length})
              </Button>
          )}
          <ItemDialog>
              <Button>
                  <PlusCircle className="mr-2 h-4 w-4"/>
                  Add New Item
              </Button>
          </ItemDialog>
        </div>
      </PageHeader>
      <ItemTable 
        data={items || []} 
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
        isLoading={isLoading}
      />

       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the selected item(s).
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
