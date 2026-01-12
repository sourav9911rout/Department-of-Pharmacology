
'use client';
import PageHeader from "@/components/page-header";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import type { AppUser } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/firebase";
import { sendSignInLinkToEmail } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

export default function UserManagementPage() {
  const { isAdmin } = useAdminAuth();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  const usersQuery = useMemoFirebase(
    () => query(collection(firestore, 'users'), orderBy('email', 'asc')),
    [firestore]
  );
  const { data: users, isLoading } = useCollection<AppUser>(usersQuery);
  
  const handleStatusChange = async (user: AppUser, status: AppUser['status']) => {
    const docRef = doc(firestore, 'users', user.id);
    
    // Only send email if status is changing to 'approved' for the first time
    const shouldSendEmail = user.status !== 'approved' && status === 'approved';

    updateDocumentNonBlocking(docRef, { status });

    if (shouldSendEmail) {
       toast({
        title: "Sending Sign-In Link...",
        description: `An email is being sent to ${user.email}.`,
      });
      try {
        const actionCodeSettings = {
          url: `${window.location.origin}/auth`,
          handleCodeInApp: true,
        };
        await sendSignInLinkToEmail(auth, user.email, actionCodeSettings);
        toast({
          title: "Sign-In Link Sent!",
          description: `${user.email} has been approved and notified.`,
        });
      } catch (error: any) {
        console.error("Error sending sign-in link:", error);
        toast({
          variant: "destructive",
          title: "Failed to Send Email",
          description: error.message || "Could not send the sign-in link.",
        });
        // Optional: revert status change if email fails
        updateDocumentNonBlocking(docRef, { status: user.status });
      }
    }
  }

  const getStatusBadgeClass = (status: AppUser['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700';
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700';
      case 'revoked': return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/50 dark:text-gray-300 dark:border-gray-700';
    }
  }


  if (!isAdmin) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          title="User Management"
          description="Approve or revoke access for application users."
        />
        <p className="text-muted-foreground">You do not have permission to view this page. Please request admin access.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="User Management"
        description="Approve or revoke access for application users."
      />

       <div className="border rounded-lg">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[50px]">S.No.</TableHead>
                    <TableHead>User Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[180px]">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                    </TableRow>
                  ))
                ) : users && users.length > 0 ? (
                  users.map((user, index) => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                           <Badge variant="outline" className={cn("font-normal", getStatusBadgeClass(user.status))}>
                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <Select defaultValue={user.status} onValueChange={(value) => handleStatusChange(user, value as AppUser['status'])}>
                                <SelectTrigger className="w-[150px] h-9 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approve</SelectItem>
                                    <SelectItem value="revoked">Revoke</SelectItem>
                                </SelectContent>
                            </Select>
                        </TableCell>
                    </TableRow>
                  ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            No user requests found.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>
    </div>
  );
}
