'use client';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { BookOpen, PlusCircle, Link as LinkIcon } from "lucide-react";
import { SopDialog } from "./components/sop-dialog";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Sop } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function SopsPage() {
  const { isAdmin } = useAdminAuth();
  const firestore = useFirestore();

  const sopsCollection = useMemoFirebase(
    () => collection(firestore, 'sops'),
    [firestore]
  );
  const { data: sops, isLoading } = useCollection<Sop>(sopsCollection);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="SOPs"
        description="Standard Operating Procedures for the department."
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
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))
        ) : sops && sops.length > 0 ? (
          sops.map((sop) => (
            <Card key={sop.id}>
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
    </div>
  );
}
