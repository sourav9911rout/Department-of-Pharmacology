import PageHeader from "@/components/page-header";
import { scheduledEvents } from "@/lib/data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import { format } from "date-fns";

export default function SchedulePage() {
  const now = new Date();
  const upcomingEvents = scheduledEvents
    .filter((event) => new Date(event.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const pastEvents = scheduledEvents
    .filter((event) => new Date(event.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Classes & Meetings"
        description="View upcoming and past scheduled events."
      />
      <section>
        <h2 className="text-2xl font-headline font-bold mb-4">Upcoming</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
                <Card key={event.id}>
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
                <Card key={event.id} className="opacity-70">
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
        </div>
      </section>
    </div>
  );
}
