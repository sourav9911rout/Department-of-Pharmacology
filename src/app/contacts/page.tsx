
'use client';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Contact } from "@/lib/types";
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
import { collection, doc, query, orderBy, deleteDoc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { ContactDialog } from "./components/contact-dialog";
import { ContactsTable } from "./components/contacts-table";

export default function ContactsPage() {
  const { isAdmin } = useAdminAuth();
  const firestore = useFirestore();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const contactsQuery = useMemoFirebase(() => {
    if (!isAdmin) return null;
    return query(collection(firestore, 'contacts'), orderBy('name', 'asc'));
  }, [firestore, isAdmin]);
  
  const { data: contacts, isLoading } = useCollection<Contact>(contactsQuery);

  const handleDelete = async () => {
    for (const itemId of selectedItems) {
      const originalDocRef = doc(firestore, 'contacts', itemId);
      const originalDoc = await getDoc(originalDocRef);
      if (originalDoc.exists()) {
        const trashDocRef = doc(collection(firestore, 'trash'));
        await setDoc(trashDocRef, {
          originalId: itemId,
          originalCollection: 'contacts',
          deletedAt: Timestamp.now().toDate().toISOString(),
          data: originalDoc.data(),
        });
        await deleteDoc(originalDocRef);
      }
    }
    setSelectedItems([]);
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Contacts"
        description="Manage the contact list for event invitations."
      >
        <div className="flex items-center gap-2">
          {isAdmin && selectedItems.length > 0 && (
              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete ({selectedItems.length})
              </Button>
          )}
          {isAdmin && (
            <ContactDialog>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Add New Contact
                </Button>
            </ContactDialog>
          )}
        </div>
      </PageHeader>
      
      {!isAdmin ? (
        <p className="text-muted-foreground">You do not have permission to view this page. Please enable Admin Mode to manage contacts.</p>
      ) : (
        <>
          <ContactsTable 
            data={contacts || []} 
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
            isLoading={isLoading}
          />

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will move the selected contact(s) to the Recycle Bin.
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
        </>
      )}
    </div>
  );
}
