'use client';
import PageHeader from "@/components/page-header";
import RequirementTable from "./components/requirement-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import type { Requirement } from "@/lib/types";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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

export default function RequirementsPage() {
  const { isAdmin } = useAdminAuth();
  const firestore = useFirestore();
  
  const requirementsCollection = useMemoFirebase(
    () => collection(firestore, 'requirements'),
    [firestore]
  );
  const { data: reqs, isLoading } = useCollection<Requirement>(requirementsCollection);

  const [selectedReqs, setSelectedReqs] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const primaryRequirements = reqs?.filter((r) => r.type === "Primary") || [];
  const secondaryRequirements = reqs?.filter(
    (r) => r.type === "Secondary"
  ) || [];
  
  const handleDelete = () => {
    selectedReqs.forEach(reqId => {
      const docRef = doc(firestore, 'requirements', reqId);
      deleteDoc(docRef);
    });
    setSelectedReqs([]);
    setIsDeleteDialogOpen(false);
  };
  
  // Combine selection from both tabs
  const handleSelectionChange = (ids: string[], type: 'Primary' | 'Secondary') => {
    const otherTypeIds = selectedReqs.filter(id => reqs?.find(r => r.id === id)?.type !== type);
    setSelectedReqs([...otherTypeIds, ...ids]);
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Requirement List"
        description="Manage primary and secondary requirements for the department."
      >
        {isAdmin && selectedReqs.length > 0 && (
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete ({selectedReqs.length})
          </Button>
        )}
      </PageHeader>

      <Tabs defaultValue="primary" onValueChange={() => { /* Clears selection on tab change if desired */ }}>
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="primary">Primary Requirements</TabsTrigger>
          <TabsTrigger value="secondary">Secondary Requirements</TabsTrigger>
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
