
'use client';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { BookOpen, PlusCircle, Link as LinkIcon, Trash2 } from "lucide-react";
import { SopDialog } from "./components/sop-dialog";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc, query, deleteDoc } from "firebase/firestore";
import type { Sop } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function SopsPage() {
  const { isAdmin } = useAdminAuth();
  const firestore = useFirestore();
  const [selectedSops, setSelectedSops] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const sopsCollection = useMemoFirebase(
    () => query(collection(firestore, 'sops')),
    [firestore]
  );
  const { data: sops, isLoading } = useCollection<Sop>(sopsCollection);

  const handleSelectSop = (sopId: string, checked: boolean) => {
    setSelectedSops(prev => 
      checked ? [...prev, sopId] : prev.filter(id => id !== sopId)
    );
  };
  
  const handleDelete = () => {
    selectedSops.forEach(sopId => {
      const docRef = doc(firestore, 'sops', sopId);
      deleteDoc(docRef);
    });
    setSelectedSops([]);
    setIsDeleteDialogOpen(false);
  };


  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="SOPs"
        description="Standard Operating Procedures for the department."
      >
        {isAdmin && (
          <div className="flex items-center gap-2">
            {selectedSops.length > 0 && (
              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({selectedSops.length})
              </Button>
            )}
            <SopDialog>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add SOP
              </Button>
            </SopDialog>
          </div>
        )}
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))
        ) : sops && sops.length > 0 ? (
          sops.map((sop) => (
            <Card key={sop.id} className="relative">
              {isAdmin && (
                <Checkbox
                  checked={selectedSops.includes(sop.id)}
                  onCheckedChange={(checked) => handleSelectSop(sop.id, !!checked)}
                  className="absolute top-4 right-4 z-10 bg-background"
                />
              )}
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  {sop.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={sop.driveLink} target="_blank" rel="noopener noreferrer">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Open Document
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground col-span-full">No SOPs have been added yet.</p>
        )}
      </div>

       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected SOP(s).
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
