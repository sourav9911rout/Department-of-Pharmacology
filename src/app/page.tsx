'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Package, ClipboardList, CalendarClock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { ProcuredItem, Requirement, ClassMeeting } from '@/lib/types';

export default function Dashboard() {
  const firestore = useFirestore();

  const procuredItemsCollection = useMemoFirebase(
    () => collection(firestore, 'procured_items'),
    [firestore]
  );
  const { data: procuredItems } = useCollection<ProcuredItem>(procuredItemsCollection);
  
  const requirementsCollection = useMemoFirebase(
    () => collection(firestore, 'requirements'),
    [firestore]
  );
  const { data: requirements } = useCollection<Requirement>(requirementsCollection);

  const scheduleCollection = useMemoFirebase(
    () => collection(firestore, 'class_meetings'),
    [firestore]
  );
  const { data: scheduledEvents } = useCollection<ClassMeeting>(scheduleCollection);

  const totalProcured = procuredItems?.length ?? 0;
  const installedItems = procuredItems?.filter(item => item.installationStatus === 'Installed').length ?? 0;
  const pendingInstallationItems = procuredItems?.filter(item => item.installationStatus === 'Pending').length ?? 0;

  const pendingRequirements = requirements?.filter(
    (r) => r.status === 'Pending'
  ).length ?? 0;
  
  const upcomingClasses = scheduledEvents?.filter(
    (e) => new Date(e.date) >= new Date()
  ).length ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold tracking-tight">
            Department of Pharmacology
          </h1>
          <p className="text-muted-foreground mt-1">AIIMS CAPFIMS</p>
        </div>
      </header>
      <main className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Procured Items
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProcured}</div>
            <p className="text-xs text-muted-foreground">
              {installedItems} installed, {pendingInstallationItems} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Requirements
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequirements}</div>
            <p className="text-xs text-muted-foreground">
              items waiting for procurement
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Classes/Meetings
            </CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{upcomingClasses}</div>
            <p className="text-xs text-muted-foreground">
              scheduled in the near future
            </p>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/40 hover:bg-primary/20 transition-colors">
          <Link
            href="https://pharmacology.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="block h-full"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Highlight
              </CardTitle>
              <Sparkles className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-primary">
                Daily Drug Highlight
              </div>
              <p className="text-xs text-muted-foreground">
                Click to view on pharmacology.vercel.app
              </p>
            </CardContent>
          </Link>
        </Card>
      </main>
    </div>
  );
}
