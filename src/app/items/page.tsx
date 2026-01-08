
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
import { collection, doc, query, orderBy, OrderByDirection, deleteDoc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type SortOption = 'name' | 'dateOfProcurement';

export default function ProcuredItemsPage() {
  const { isAdmin } = useAdminAuth();
  const firestore = useFirestore();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('dateOfProcurement');
  const [sortDirection, setSortDirection] = useState<OrderByDirection>('asc');

  const procuredItemsQuery = useMemoFirebase(() => {
    return query(collection(firestore, 'procured_items'), orderBy(sortOption, sortDirection));
  }, [firestore, sortOption, sortDirection]);
  
  const { data: items, isLoading } = useCollection<ProcuredItem>(procuredItemsQuery);

  const handleDelete = async () => {
    for (const itemId of selectedItems) {
      const originalDocRef = doc(firestore, 'procured_items', itemId);
      const originalDoc = await getDoc(originalDocRef);
      if (originalDoc.exists()) {
        const trashDocRef = doc(collection(firestore, 'trash'));
        await setDoc(trashDocRef, {
          originalId: itemId,
          originalCollection: 'procured_items',
          deletedAt: Timestamp.now().toDate().toISOString(),
          data: originalDoc.data(),
        });
        await deleteDoc(originalDocRef);
      }
    }
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

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
            <Label htmlFor="sort-by" className="text-sm font-medium">Sort by</Label>
            <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                <SelectTrigger id="sort-by" className="w-[240px]">
                    <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="name">Name (A to Z)</SelectItem>
                    <SelectItem value="dateOfProcurement">Procurement Date (Old to New)</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

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
                        This action cannot be undone. This will move the selected item(s) to the Recycle Bin.
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
