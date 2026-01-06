import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Package, ClipboardList, CalendarClock, Sparkles } from 'lucide-react';
import { procuredItems, requirements, scheduledEvents } from '@/lib/data';
import Link from 'next/link';

export default function Dashboard() {
  const totalProcured = procuredItems.length;
  const pendingRequirements = requirements.filter(
    (r) => r.status === 'Pending'
  ).length;
  const upcomingClasses = scheduledEvents.filter(
    (e) => new Date(e.date) >= new Date()
  ).length;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center gap-4">
        <svg
          role="img"
          aria-labelledby="capfims-logo-title"
          viewBox="0 0 100 100"
          className="h-16 w-16 text-primary"
          fill="currentColor"
        >
          <title id="capfims-logo-title">AIIMS CAPFIMS Logo</title>
          <circle cx="50" cy="50" r="48" fill="#1e3a8a" />
          <g transform="translate(50, 50) scale(0.8)">
            <path
              d="M-2, -45 L-2, 25 L2, 25 L2, -45 Z"
              fill="white"
              stroke="white"
              strokeWidth="1"
            />
            <path
              d="M2, -45 C20, -35 20, -15 2, -5 C-16, -15 -16, -35 -2, -45"
              fill="none"
              stroke="white"
              strokeWidth="4"
            />
            <path
              d="M-2, 5 C25, 15 25, 35 -2, 45 C-29, 35 -29, 15 -2, 5"
              fill="none"
              stroke="white"
              strokeWidth="4"
            />
            <path
              d="M-4, 25h8v20h-8z"
              fill="white"
            />
            <path
              d="M-30, 20 A30,30 0 0,1 30,20"
              stroke="white"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
             <path
              d="M-25, 10 A25,25 0 0,1 25,10"
              stroke="white"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        </svg>
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
              items currently in inventory
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
