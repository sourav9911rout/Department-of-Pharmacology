'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import type { ClassMeeting } from '@/lib/types';
import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';
import { Textarea } from '@/components/ui/textarea';
import { sendEventEmail } from '@/ai/flows/send-event-email';
import { useToast } from '@/hooks/use-toast';

export function ScheduleDialog({
  children,
  event,
}: {
  children: React.ReactNode;
  event?: ClassMeeting;
}) {
  const { isAdmin } = useAdminAuth();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);
  const isEditing = !!event;
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const inviteesString = (formData.get('invitees') as string) || '';
    const invitees = inviteesString.split(',').map(email => email.trim()).filter(email => email);

    const newEventData = {
      topic: formData.get('topic') as string,
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      conductedBy: formData.get('conductedBy') as string,
      meetLink: formData.get('meetLink') as string,
      invitees: invitees,
    };
    
    if (isEditing && event) {
      const docRef = doc(firestore, 'class_meetings', event.id);
      setDocumentNonBlocking(docRef, newEventData, { merge: true });
    } else {
      const collectionRef = collection(firestore, 'class_meetings');
      addDocumentNonBlocking(collectionRef, newEventData);
    }

    if(invitees.length > 0) {
      toast({
        title: "Sending Invitations",
        description: "The event invitations are being sent to the invitees.",
      });
      try {
        await sendEventEmail({
          ...newEventData
        });
         toast({
          title: "Invitations Sent",
          description: "All invitees have been notified.",
        });
      } catch (error) {
        console.error("Failed to send emails", error);
        toast({
          variant: "destructive",
          title: "Email Error",
          description: "Could not send invitations. Please check the email addresses and your API key.",
        });
      }
    }
    
    setOpen(false);
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Event' : 'Add New Event'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the details of the event.' : 'Fill in the details for the new event.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="topic" className="text-right">
                Topic
              </Label>
              <Input id="topic" name="topic" defaultValue={event?.topic} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input id="date" name="date" type="date" defaultValue={event?.date} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time
              </Label>
              <Input id="time" name="time" type="time" defaultValue={event?.time} className="col-span-3" required />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="conductedBy" className="text-right">
                Conducted By
              </Label>
              <Input id="conductedBy" name="conductedBy" defaultValue={event?.conductedBy} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="meetLink" className="text-right">
                Meet Link
              </Label>
              <Input id="meetLink" name="meetLink" defaultValue={event?.meetLink} className="col-span-3" required />
            </div>
             <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="invitees" className="text-right mt-2">
                Invitees
              </Label>
              <Textarea id="invitees" name="invitees" defaultValue={event?.invitees?.join(', ')} className="col-span-3" placeholder="Enter comma-separated email addresses" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{isEditing ? 'Save Changes' : 'Add Event'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
