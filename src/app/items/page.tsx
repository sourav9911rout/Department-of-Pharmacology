'use client';
import PageHeader from "@/components/page-header";
import ItemTable from "./components/item-table";
import { ItemDialog } from "./components/item-dialog";
import { Button } from "@/components/ui/button";
import { FileDown, PlusCircle, Trash2 } from "lucide-react";
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
import { collection, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function ProcuredItemsPage() {
  const { isAdmin } = useAdminAuth();
  const firestore = useFirestore();
  const procuredItemsCollection = useMemoFirebase(
    () => query(collection(firestore, 'procured_items'), orderBy('dateOfProcurement', 'asc')),
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
  
  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.text("Procured Items", 14, 16);
    (doc as any).autoTable({
      head: [['Name', 'Category', 'Quantity', 'Procurement Date', 'Installation Status', 'Installation Date', 'Remarks']],
      body: (items || []).map(item => [
        item.name,
        item.category,
        item.quantity,
        item.dateOfProcurement,
        item.installationStatus,
        item.dateOfInstallation || 'N/A',
        item.remarks || 'N/A'
      ]),
      startY: 20,
    });
    doc.save("procured_items.pdf");
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Procured Items"
        description="Track all items procured by the department."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDownloadPdf}>
            <FileDown className="mr-2 h-4 w-4"/>
            Download PDF
          </Button>
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
