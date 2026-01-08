
'use client';
import PageHeader from "@/components/page-header";
import ItemTable from "./components/item-table";
import { ItemDialog } from "./components/item-dialog";
import { Button } from "@/components/ui/button";
import { FileDown, PlusCircle, Trash2, ArrowUpDown } from "lucide-react";
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
import { collection, deleteDoc, doc, orderBy, query, WhereFilter, where } from "firebase/firestore";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type SortOption = 'name' | 'dateOfInstallation' | 'dateOfProcurement';

export default function ProcuredItemsPage() {
  const { isAdmin } = useAdminAuth();
  const firestore = useFirestore();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('dateOfProcurement');

  const procuredItemsCollection = useMemoFirebase(
    () => {
        let q = query(collection(firestore, 'procured_items'));
        
        // Firestore requires the first orderBy field to be in the inequality filter if one exists
        // We don't have one here, but it's good practice.
        // We must have an index for each field we order by.
        q = query(q, orderBy(sortBy, 'asc'));

        return q;
    },
    [firestore, sortBy]
  );
  
  const { data: items, isLoading } = useCollection<ProcuredItem>(procuredItemsCollection);

  const handleDelete = () => {
    selectedItems.forEach(itemId => {
      const docRef = doc(firestore, 'procured_items', itemId);
      deleteDoc(docRef);
    });
    setSelectedItems([]);
    setIsDeleteDialogOpen(false);
  };
  
  const handleDownloadPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.text("Procured Items", 14, 16);
    (doc as any).autoTable({
      head: [['S.No.', 'Name', 'Category', 'Qty', 'Procurement Date', 'Status', 'Install Date', 'Remarks']],
      body: (items || []).map((item, index) => [
        index + 1,
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
  
  const getSortLabel = () => {
    switch (sortBy) {
        case 'name': return 'Name (A-Z)';
        case 'dateOfInstallation': return 'Installation Date';
        case 'dateOfProcurement': return 'Procurement Date';
        default: return 'Sort by';
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Procured Items"
        description="Track all items procured by the department."
      >
        <div className="flex items-center gap-2">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                {getSortLabel()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setSortBy('dateOfProcurement')}>
                Procurement Date (Old to New)
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setSortBy('name')}>
                Name (A to Z)
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setSortBy('dateOfInstallation')}>
                 Installation Date (Old to New)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
          {isAdmin && (
            <ItemDialog>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Add New Item
                </Button>
            </ItemDialog>
          )}
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
