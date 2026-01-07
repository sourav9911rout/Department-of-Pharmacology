'use client';

import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { FileText, PlusCircle } from 'lucide-react';
import type { SOP } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { SopDialog } from './components/sop-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function SopsPage() {
  const { isAdmin } = useAdminAuth();
  const firestore = useFirestore();
  const sopsCollection = useMemoFirebase(
    () => collection(firestore, 'sops'),
    [firestore]
  );
  const { data: sops, isLoading } = useCollection<SOP>(sopsCollection);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Standard Operating Procedures"
        description="Browse and access all departmental SOPs."
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
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))
          : sops && sops.length > 0
          ? sops.map((sop) => (
              <Card key={sop.id}>
                <CardHeader className="flex-row items-start gap-4 space-y-0">
                    <div className="flex-shrink-0">
                        <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className='w-full'>
                        <CardTitle className="text-lg">{sop.name}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link
                      href={sop.driveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open Document
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          : !isLoading && (
              <div className="col-span-full text-center text-muted-foreground py-12">
                <p>No SOPs have been added yet.</p>
              </div>
            )}
      </div>
    </div>
  );
}
