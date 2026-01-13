
'use client';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc, query, updateDoc, writeBatch, Timestamp } from "firebase/firestore";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import type { AppUser } from "@/lib/types";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

type Action = AppUser['status'] | 'make_admin' | 'demote_admin';

export default function UserManagementPage() {
  const { isAdmin, user } = useAdminAuth();
  const firestore = useFirestore();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const usersQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'users')) : null,
    [firestore]
  );
  const { data: users, isLoading } = useCollection<AppUser>(usersQuery);

  const handleAction = async (userId: string, action: Action) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', userId);

    if (action === 'make_admin') {
      await updateDoc(userDocRef, { role: 'admin', status: 'approved' });
    } else if (action === 'demote_admin') {
      await updateDoc(userDocRef, { role: 'user' });
    } else { // It's a status change
      await updateDoc(userDocRef, { status: action });
    }
  };
  
  const handleDelete = async () => {
    if (!firestore) return;
    const batch = writeBatch(firestore);

    selectedUsers.forEach(userId => {
      const originalDocRef = doc(firestore, 'users', userId);
      const userData = users?.find(u => u.id === userId);
      
      if (userData) {
        const trashDocRef = doc(collection(firestore, 'trash'));
        batch.set(trashDocRef, {
          originalId: userId,
          originalCollection: 'users',
          deletedAt: Timestamp.now(),
          data: userData,
        });
        batch.delete(originalDocRef);
      }
    });

    await batch.commit();
    setSelectedUsers([]);
    setIsDeleteDialogOpen(false);
  };

  const handleSelect = (userId: string, checked: boolean) => {
    setSelectedUsers(prev => checked ? [...prev, userId] : prev.filter(id => id !== userId));
  };
  
  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      const allUserIds = (users || [])
        .filter(u => u.email.toLowerCase() !== user?.email?.toLowerCase())
        .map(u => u.id);
      setSelectedUsers(allUserIds);
    } else {
      setSelectedUsers([]);
    }
  };

  const getStatusBadgeClass = (status: AppUser['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700';
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700';
      case 'revoked': return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  const getRoleBadgeClass = (role: AppUser['role']) => {
      if (role === 'admin') {
          return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700';
      }
      return 'border-gray-300 dark:border-gray-700';
  }

  const filteredUsers = users?.filter(u => u.email.toLowerCase() !== user?.email?.toLowerCase());
  
  const isAllSelected = (filteredUsers?.length || 0) > 0 && selectedUsers.length === filteredUsers?.length;
  const isSomeSelected = selectedUsers.length > 0 && selectedUsers.length < (filteredUsers?.length || 0);
  
  if (!isAdmin) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          title="User Management"
          description="Approve or revoke access for users."
        />
        <p className="text-muted-foreground text-center mt-8">
          You need admin privileges to manage users.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="User Management"
        description="Approve, revoke, or promote users."
      >
        {selectedUsers.length > 0 && (
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete ({selectedUsers.length})
          </Button>
        )}
      </PageHeader>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={isAllSelected || (isSomeSelected ? 'indeterminate' : false)}
                  onCheckedChange={handleSelectAll}
                  disabled={!filteredUsers || filteredUsers.length === 0}
                />
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : filteredUsers && filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <TableRow key={u.id}>
                   <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(u.id)}
                        onCheckedChange={(checked) => handleSelect(u.id, !!checked)}
                      />
                  </TableCell>
                  <TableCell className="font-medium">{u.email}</TableCell>
                   <TableCell>
                        <Badge variant="outline" className={cn("capitalize", getRoleBadgeClass(u.role))}>
                            {u.role}
                        </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("capitalize", getStatusBadgeClass(u.status))}>
                        {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAction(u.id, 'approved')}>
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction(u.id, 'pending')}>
                            Set to Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction(u.id, 'revoked')}>
                            Revoke
                          </DropdownMenuItem>
                          {u.role === 'user' && (
                            <DropdownMenuItem onClick={() => handleAction(u.id, 'make_admin')}>
                              Promote to Admin
                            </DropdownMenuItem>
                          )}
                          {u.role === 'admin' && (
                            <DropdownMenuItem onClick={() => handleAction(u.id, 'demote_admin')}>
                              Demote to User
                            </DropdownMenuItem>
                          )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No other users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will move the selected user(s) to the Recycle Bin. They will need to request access again.
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

    