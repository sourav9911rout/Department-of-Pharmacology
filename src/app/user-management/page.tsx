
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

type StatusAndRole = AppUser['status'] | 'make_admin';

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

  const handleStatusChange = async (userId: string, value: StatusAndRole) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', userId);

    if (value === 'make_admin') {
      await updateDoc(userDocRef, { role: 'admin', status: 'approved' });
    } else {
      // If we are changing the status of an admin, set them back to user role as well
      const userToUpdate = users?.find(u => u.id === userId);
      if(userToUpdate?.role === 'admin') {
        await updateDoc(userDocRef, { status: value, role: 'user' });
      } else {
        await updateDoc(userDocRef, { status: value });
      }
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
              <TableHead className="w-[200px]">Status / Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-36" /></TableCell>
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
                    <Select
                      value={u.status}
                      onValueChange={(value) => handleStatusChange(u.id, value as StatusAndRole)}
                    >
                      <SelectTrigger className={cn("w-[140px] h-8 text-xs", getStatusBadgeClass(u.status))}>
                          <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="revoked">Revoked</SelectItem>
                          {u.role !== 'admin' && <SelectItem value="make_admin">Make Admin</SelectItem>}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
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
