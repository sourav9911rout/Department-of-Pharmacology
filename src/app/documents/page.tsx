'use client';
import PageHeader from "@/components/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, FolderGit2, PlusCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { DocumentDialog } from "./components/document-dialog";
import type { DocumentLink } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, deleteDoc, doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function DocumentsPage() {
  const { isAdmin } = useAdminAuth();
  const firestore = useFirestore();
  const documentsCollection = useMemoFirebase(
    () => collection(firestore, 'documents'), // Assuming collection name is 'documents'
    [firestore]
  );
  const { data: documents, isLoading } = useCollection<DocumentLink>(documentsCollection);

  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleSelectDocument = (docId: string, checked: boolean) => {
    if (checked) {
      setSelectedDocuments((prev) => [...prev, docId]);
    } else {
      setSelectedDocuments((prev) => prev.filter((id) => id !== docId));
    }
  };

  const handleDelete = () => {
    selectedDocuments.forEach(docId => {
      const docRef = doc(firestore, 'documents', docId);
      deleteDoc(docRef);
    });
    setSelectedDocuments([]);
    setIsDeleteDialogOpen(false);
  };
  
  const handleSaveDocument = (doc: Omit<DocumentLink, 'id'>) => {
    // This is handled by the dialog now
  };
  
  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.text("Documents & Resources", 14, 16);
    (doc as any).autoTable({
        head: [['Title', 'Description', 'Link']],
        body: (documents || []).map(d => [
            d.title,
            d.description,
            d.driveLink
        ]),
        startY: 20,
    });
    doc.save("documents.pdf");
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Documents & Resources"
        description="Access official documents, SOPs, and guidelines from Google Drive."
      >
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleDownloadPdf}>
                <FileDown className="mr-2 h-4 w-4"/>
                Download PDF
            </Button>
            {isAdmin && selectedDocuments.length > 0 && (
              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({selectedDocuments.length})
              </Button>
            )}
            <DocumentDialog onSave={handleSaveDocument}>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Add New Document
                </Button>
            </DocumentDialog>
        </div>
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardHeader>
            </Card>
          ))
        ) : (documents || []).map((doc) => (
          <div key={doc.id} className="relative">
             {isAdmin && (
                <Checkbox
                    checked={selectedDocuments.includes(doc.id)}
                    onCheckedChange={(checked) => handleSelectDocument(doc.id, !!checked)}
                    className="absolute top-4 left-4 z-10 bg-background"
                />
            )}
            <Link href={doc.driveLink} target="_blank" rel="noopener noreferrer" className="block h-full">
              <Card className="hover:border-primary hover:bg-primary/5 transition-all h-full">
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className="p-3 bg-secondary rounded-lg">
                      <FolderGit2 className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <CardTitle>{doc.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {doc.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </div>
        ))}
      </div>
       {!isLoading && (documents || []).length === 0 && (
          <div className="text-center text-muted-foreground col-span-full py-12">
            No documents available.
          </div>
        )}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the selected document(s).
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
