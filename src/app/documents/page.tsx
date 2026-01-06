'use client';
import PageHeader from "@/components/page-header";
import { documentLinks } from "@/lib/data";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderGit2, PlusCircle, Trash2 } from "lucide-react";
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

export default function DocumentsPage() {
  const { isAdmin } = useAdminAuth();
  const [localDocuments, setLocalDocuments] = useState(documentLinks);
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
    setLocalDocuments((prev) =>
      prev.filter((doc) => !selectedDocuments.includes(doc.id))
    );
    setSelectedDocuments([]);
    setIsDeleteDialogOpen(false);
  };
  
  const handleSaveDocument = (doc: Omit<DocumentLink, 'id'>) => {
     setLocalDocuments((prev) => [
      ...prev,
      { ...doc, id: `D${prev.length + 1}` },
    ]);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Documents & Resources"
        description="Access official documents, SOPs, and guidelines from Google Drive."
      >
        <div className="flex items-center gap-2">
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
        {localDocuments.map((doc) => (
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
       {localDocuments.length === 0 && (
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
