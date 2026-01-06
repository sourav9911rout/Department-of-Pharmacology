'use client';
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, PlusCircle, Trash2, Video } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import type { ClassMeeting } from "@/lib/types";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ScheduleDialog } from "./components/schedule-dialog";
import { addHours, parse } from 'date-fns';
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, deleteDoc, doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function SchedulePage() {
  const { isAdmin } = useAdminAuth();
  const firestore = useFirestore();
  const scheduleCollection = useMemoFirebase(
    () => collection(firestore, 'class_meetings'),
    [firestore]
  );
  const { data: events, isLoading } = useCollection<ClassMeeting>(scheduleCollection);

  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const now = new Date();
  
  const getEventDateTime = (event: ClassMeeting) => {
    return parse(`${event.date} ${event.time}`, 'yyyy-MM-dd HH:mm', new Date());
  };

  const upcomingEvents = events
    ?.filter((event) => addHours(getEventDateTime(event), 1) >= now)
    .sort((a, b) => getEventDateTime(a).getTime() - getEventDateTime(b).getTime()) || [];
  
  const pastEvents = events
    ?.filter((event) => addHours(getEventDateTime(event), 1) < now)
    .sort((a, b) => getEventDateTime(b).getTime() - getEventDateTime(a).getTime()) || [];

  const handleSelectEvent = (eventId: string, checked: boolean) => {
    if (checked) {
      setSelectedEvents((prev) => [...prev, eventId]);
    } else {
      setSelectedEvents((prev) => prev.filter((id) => id !== eventId));
    }
  };

  const handleDelete = () => {
    selectedEvents.forEach(eventId => {
      const docRef = doc(firestore, 'class_meetings', eventId);
      deleteDoc(docRef);
    });
    setSelectedEvents([]);
    setIsDeleteDialogOpen(false);
  };

  const handleSaveEvent = (event: Omit<ClassMeeting, 'id'>) => {
    // This is handled by the dialog now
  };
  
  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.text("Upcoming Classes & Meetings", 14, 16);
    (doc as any).autoTable({
        head: [['Topic', 'Date', 'Time', 'Conducted By']],
        body: upcomingEvents.map(event => [
            event.topic,
            format(getEventDateTime(event), 'MMM d, yyyy'),
            format(getEventDateTime(event), 'p'),
            event.conductedBy,
        ]),
        startY: 20,
    });

    if (pastEvents.length > 0) {
        (doc as any).autoTable({
            head: [['Past Events']],
            body: [],
            startY: (doc as any).autoTable.previous.finalY + 10,
            theme: 'plain',
            styles: {
                head: {
                    fontSize: 12,
                    fontStyle: 'bold',
                }
            }
        });
        (doc as any).autoTable({
            head: [['Topic', 'Date', 'Time', 'Conducted By']],
            body: pastEvents.map(event => [
                event.topic,
                format(getEventDateTime(event), 'MMM d, yyyy'),
                format(getEventDateTime(event), 'p'),
                event.conductedBy,
            ]),
            startY: (doc as any).autoTable.previous.finalY + 2,
        });
    }

    doc.save("class_schedule.pdf");
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Classes & Meetings"
        description="View upcoming and past scheduled events."
      >
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleDownloadPdf}>
                <FileDown className="mr-2 h-4 w-4"/>
                Download PDF
            </Button>
            {isAdmin && selectedEvents.length > 0 && (
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({selectedEvents.length})
            </Button>
            )}
            <ScheduleDialog onSave={handleSaveEvent}>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Event
                </Button>
            </ScheduleDialog>
        </div>
      </PageHeader>
      <section>
        <h2 className="text-2xl font-headline font-bold mb-4">Upcoming</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))
            ) : upcomingEvents.length > 0 ? upcomingEvents.map(event => (
                <Card key={event.id} className="relative">
                     {isAdmin && (
                        <Checkbox
                            checked={selectedEvents.includes(event.id)}
                            onCheckedChange={(checked) => handleSelectEvent(event.id, !!checked)}
                            className="absolute top-4 right-4 z-10 bg-background"
                        />
                    )}
                    <CardHeader>
                        <CardTitle>{event.topic}</CardTitle>
                        <CardDescription>Conducted by: {event.conductedBy}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold">{format(getEventDateTime(event), 'EEEE, MMMM d, yyyy')}</p>
                        <p className="text-muted-foreground">{format(getEventDateTime(event), 'p')}</p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <a href={event.meetLink} target="_blank" rel="noopener noreferrer">
                                <Video className="mr-2 h-4 w-4"/>
                                Join Google Meet
                            </a>
                        </Button>
                    </CardFooter>
                </Card>
            )) : <p className="text-muted-foreground col-span-full">No upcoming events scheduled.</p>}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-headline font-bold mb-4">Past Events</h2>
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
               Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="opacity-70">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </CardContent>
                </Card>
              ))
            ) : pastEvents.map(event => (
                <Card key={event.id} className="opacity-70 relative">
                     {isAdmin && (
                        <Checkbox
                            checked={selectedEvents.includes(event.id)}
                            onCheckedChange={(checked) => handleSelectEvent(event.id, !!checked)}
                            className="absolute top-4 right-4 z-10 bg-background"
                        />
                    )}
                    <CardHeader>
                        <CardTitle>{event.topic}</CardTitle>
                        <CardDescription>Conducted by: {event.conductedBy}</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <p className="font-semibold">{format(getEventDateTime(event), 'MMMM d, yyyy')}</p>
                        <p className="text-muted-foreground">{format(getEventDateTime(event), 'p')}</p>
                    </CardContent>
                </Card>
            ))}
             {!isLoading && pastEvents.length === 0 && (
                <p className="text-muted-foreground col-span-full">No past events found.</p>
             )}
        </div>
      </section>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the selected event(s).
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
