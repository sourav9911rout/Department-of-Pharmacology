'use client';
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Link as LinkIcon, PlusCircle } from "lucide-react";
import type { Sop } from "@/lib/types";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { SopDialog } from "./components/sop-dialog";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function SopsPage() {
  const { isAdmin } = useAdminAuth();
  const firestore = useFirestore();
  const sopsCollection = useMemoFirebase(
    () => query(collection(firestore, 'sops'), orderBy('title', 'asc')),
    [firestore]
  );
  const { data: sops, isLoading } = useCollection<Sop>(sopsCollection);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Standard Operating Procedures"
        description="A list of all departmental SOPs."
      >
        {isAdmin && (
           <SopDialog>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add SOP
                </Button>
            </SopDialog>
        )}
      </PageHeader>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
                <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardFooter className="flex justify-between">
                <Skeleton className="h-10 w-24" />
                </CardFooter>
            </Card>
            ))
        ) : sops && sops.length > 0 ? sops.map(sop => (
            <Card key={sop.id} className="flex flex-col">
                <CardHeader className="flex-grow">
                    <CardTitle className="flex items-start gap-3">
                        <FileText className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <span>{sop.title}</span>
                    </CardTitle>
                </CardHeader>
                <CardFooter className="flex justify-between items-center">
                    <Button asChild>
                        <Link href={sop.driveLink} target="_blank" rel="noopener noreferrer">
                            <LinkIcon className="mr-2 h-4 w-4"/>
                            Open Link
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        )) : (
            <p className="text-muted-foreground col-span-full">No SOPs found.</p>
        )}
      </div>
    </div>
  );
}
