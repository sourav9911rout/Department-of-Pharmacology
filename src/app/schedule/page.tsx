'use client';
import PageHeader from "@/components/page-header";
import { scheduledEvents } from "@/lib/data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Video } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import type { ScheduledEvent } from "@/lib/types";
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

export default function SchedulePage() {
  const { isAdmin } = useAdminAuth();
  const [events, setEvents] = useState<ScheduledEvent[]>(scheduledEvents);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const now = new Date();
  
  const getEventDateTime = (event: ScheduledEvent) => {
    // It's important to parse the time correctly. Assuming time is in 'hh:mm a' format.
    // The date string 'yyyy-MM-dd' is parsed correctly by default.
    return parse(`${event.date} ${event.time}`, 'yyyy-MM-dd hh:mm a', new Date());
  };

  const upcomingEvents = events
    .filter((event) => addHours(getEventDateTime(event), 1) >= now)
    .sort((a, b) => getEventDateTime(a).getTime() - getEventDateTime(b).getTime());
  
  const pastEvents = events
    .filter((event) => addHours(getEventDateTime(event), 1) < now)
    .sort((a, b) => getEventDateTime(b).getTime() - getEventDateTime(a).getTime());

  const handleSelectEvent = (eventId: string, checked: boolean) => {
    if (checked) {
      setSelectedEvents((prev) => [...prev, eventId]);
    } else {
      setSelectedEvents((prev) => prev.filter((id) => id !== eventId));
    }
  };

  const handleDelete = () => {
    setEvents((prev) =>
      prev.filter((event) => !selectedEvents.includes(event.id))
    );
    setSelectedEvents([]);
    setIsDeleteDialogOpen(false);
  };

  const handleSaveEvent = (event: Omit<ScheduledEvent, 'id'>) => {
    setEvents((prev) => [
      ...prev,
      { ...event, id: `E${prev.length + 1}` },
    ]);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Classes & Meetings"
        description="View upcoming and past scheduled events."
      >
        <div className="flex items-center gap-2">
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
            {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
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
                        <p className="font-semibold">{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</p>
                        <p className="text-muted-foreground">{event.time}</p>
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
            {pastEvents.map(event => (
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
                         <p className="font-semibold">{format(new Date(event.date), 'MMMM d, yyyy')}</p>
                        <p className="text-muted-foreground">{event.time}</p>
                    </CardContent>
                </Card>
            ))}
             {pastEvents.length === 0 && (
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
