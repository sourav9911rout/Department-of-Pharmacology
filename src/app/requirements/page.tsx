'use client';
import PageHeader from "@/components/page-header";
import RequirementTable from "./components/requirement-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import type { Requirement } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { FileDown, PlusCircle, Trash2 } from "lucide-react";
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
import { collection, doc, orderBy, query, deleteDoc } from "firebase/firestore";
import { RequirementDialog } from "./components/requirement-dialog";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export default function RequirementsPage() {
  const { isAdmin } = useAdminAuth();
  const firestore = useFirestore();
  const [activeTab, setActiveTab] = useState('primary');
  
  const requirementsCollection = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'requirements'), orderBy('name', 'asc')) : null,
    [firestore]
  );
  const { data: reqs, isLoading } = useCollection<Requirement>(requirementsCollection);

  const [selectedReqs, setSelectedReqs] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const primaryRequirements = reqs?.filter((r) => r.type === "Primary") || [];
  const secondaryRequirements = reqs?.filter(
    (r) => r.type === "Secondary"
  ) || [];
  const tertiaryRequirements = reqs?.filter(
    (r) => r.type === "Tertiary"
  ) || [];
  
  const handleDelete = async () => {
    if (!firestore || !isAdmin) return;

    const deletePromises = selectedReqs.map(id => deleteDoc(doc(firestore, 'requirements', id)));
    await Promise.all(deletePromises);
    
    setSelectedReqs([]);
    setIsDeleteDialogOpen(false);
  };
  
  const handleSelectionChange = (ids: string[], type: 'Primary' | 'Secondary' | 'Tertiary') => {
    const otherTypeIds = selectedReqs.filter(id => reqs?.find(r => r.id === id)?.type !== type);
    setSelectedReqs([...otherTypeIds, ...ids]);
  }
  
  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    let dataToExport: Requirement[] = [];
    let title = "Requirement List";

    if (activeTab === 'primary') {
      dataToExport = primaryRequirements;
      title = "Primary Requirements";
    } else if (activeTab === 'secondary') {
      dataToExport = secondaryRequirements;
      title = "Secondary Requirements";
    } else if (activeTab === 'tertiary') {
        dataToExport = tertiaryRequirements;
        title = "Tertiary Requirements";
    }

    doc.text(title, 14, 16);
    (doc as any).autoTable({
      head: [['S.No.', 'Item Name', 'Required Quantity', 'Status', 'Remarks']],
      body: dataToExport.map((req, index) => [
        index + 1,
        req.name,
        req.requiredQuantity,
        req.status,
        req.remarks || 'N/A'
      ]),
      startY: 20,
    });
    doc.save(`requirements_${activeTab}.pdf`);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Requirement List"
        description="Manage primary and secondary requirements for the department."
      >
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleDownloadPdf}>
                <FileDown className="mr-2 h-4 w-4"/>
                Download PDF
            </Button>
            {isAdmin && selectedReqs.length > 0 && (
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({selectedReqs.length})
            </Button>
            )}
            {isAdmin && (
              <RequirementDialog>
                  <Button>
                      <PlusCircle className="mr-2 h-4 w-4"/>
                      Add Requirement
                  </Button>
              </RequirementDialog>
            )}
        </div>
      </PageHeader>
      
      <Tabs defaultValue="primary" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 md:w-[600px]">
          <TabsTrigger value="primary">Primary Requirements</TabsTrigger>
          <TabsTrigger value="secondary">Secondary Requirements</TabsTrigger>
          <TabsTrigger value="tertiary">Tertiary Requirements</TabsTrigger>
        </TabsList>
        <TabsContent value="primary" className="mt-4">
          <RequirementTable
            data={primaryRequirements}
            selectedItems={selectedReqs.filter(id => primaryRequirements.some(r => r.id === id))}
            onSelectionChange={(ids) => handleSelectionChange(ids, 'Primary')}
            isLoading={isLoading}
          />
        </TabsContent>
        <TabsContent value="secondary" className="mt-4">
          <RequirementTable
            data={secondaryRequirements}
            selectedItems={selectedReqs.filter(id => secondaryRequirements.some(r => r.id === id))}
            onSelectionChange={(ids) => handleSelectionChange(ids, 'Secondary')}
            isLoading={isLoading}
          />
        </TabsContent>
         <TabsContent value="tertiary" className="mt-4">
          <RequirementTable
            data={tertiaryRequirements}
            selectedItems={selectedReqs.filter(id => tertiaryRequirements.some(r => r.id === id))}
            onSelectionChange={(ids) => handleSelectionChange(ids, 'Tertiary')}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the selected requirement(s).
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
