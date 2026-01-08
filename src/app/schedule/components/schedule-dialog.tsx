
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
import type { ClassMeeting, Contact } from '@/lib/types';
import { useState, useEffect, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc, query } from 'firebase/firestore';
import { sendEventEmail } from '@/ai/flows/send-event-email';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, X } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [selectedInvitees, setSelectedInvitees] = useState<string[]>([]);
  const [manualInvitees, setManualInvitees] = useState<string[]>(['']);

  const isEditing = !!event;
  const { toast } = useToast();

  const contactsQuery = useMemoFirebase(() => query(collection(firestore, 'contacts')), [firestore]);
  const { data: contacts, isLoading: contactsLoading } = useCollection<Contact>(contactsQuery);

  useEffect(() => {
    if (open) {
      if (event?.invitees) {
        // Separate invitees into selected contacts and manual entries
        const contactEmails = contacts?.map(c => c.email) || [];
        const eventContacts = event.invitees.filter(email => contactEmails.includes(email));
        const eventManual = event.invitees.filter(email => !contactEmails.includes(email));

        setSelectedInvitees(eventContacts);
        setManualInvitees(eventManual.length > 0 ? eventManual : ['']);
      } else {
        setSelectedInvitees([]);
        setManualInvitees(['']);
      }
    }
  }, [open, event, contacts]);

  const allInvitees = useMemo(() => {
    return [...new Set([...selectedInvitees, ...manualInvitees.map(e => e.trim()).filter(Boolean)])];
  }, [selectedInvitees, manualInvitees]);

  const handleManualInviteeChange = (index: number, value: string) => {
    const newManualInvitees = [...manualInvitees];
    newManualInvitees[index] = value;
    setManualInvitees(newManualInvitees);
  };

  const addManualInviteeField = () => {
    setManualInvitees([...manualInvitees, '']);
  };

  const removeManualInviteeField = (index: number) => {
    if (manualInvitees.length > 1) {
      const newManualInvitees = manualInvitees.filter((_, i) => i !== index);
      setManualInvitees(newManualInvitees);
    } else {
      setManualInvitees(['']);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (allInvitees.length === 0) {
        toast({
            variant: "destructive",
            title: "No Invitees",
            description: "Please add at least one invitee.",
        });
        return;
    }

    const newEventData = {
      topic: formData.get('topic') as string,
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      conductedBy: formData.get('conductedBy') as string,
      meetLink: formData.get('meetLink') as string,
      invitees: allInvitees,
    };
    
    if (isEditing && event) {
      const docRef = doc(firestore, 'class_meetings', event.id);
      setDocumentNonBlocking(docRef, newEventData, { merge: true });
    } else {
      const collectionRef = collection(firestore, 'class_meetings');
      addDocumentNonBlocking(collectionRef, newEventData);
    }

    if(allInvitees.length > 0) {
      toast({
        title: "Sending Invitations",
        description: "The event invitations are being sent to the invitees.",
      });
      try {
        await sendEventEmail({ ...newEventData, invitees: allInvitees });
         toast({
          title: "Invitations Sent",
          description: "All invitees have been notified.",
        });
      } catch (error) {
        console.error("Failed to send emails", error);
        toast({
          variant: "destructive",
          title: "Email Error",
          description: error instanceof Error ? error.message : "Could not send invitations. Please check your email settings and credentials in the .env file.",
        });
      }
    }
    
    setOpen(false);
  };

  if (!isAdmin) {
    return null;
  }

  const handleContactSelect = (contactEmail: string, isSelected: boolean) => {
    setSelectedInvitees(prev => {
      if (isSelected) {
        return [...prev, contactEmail];
      } else {
        return prev.filter(email => email !== contactEmail);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Event' : 'Add New Event'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the details of the event.' : 'Fill in the details for the new event.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
            {/* Left Column: Event Details */}
            <div className="space-y-4">
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
            </div>

            {/* Right Column: Invitees */}
            <div className="space-y-4">
              <Label>Invitees</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {allInvitees.map(email => {
                    const contact = contacts?.find(c => c.email === email);
                    const displayName = contact ? `${contact.name} ${contact.designation ? `(${contact.designation})` : ''}` : email;
                    return (
                        <Badge key={email} variant="secondary" className="flex items-center gap-1">
                            {displayName}
                            <button type='button' onClick={() => {
                                setSelectedInvitees(p => p.filter(e => e !== email));
                                setManualInvitees(p => p.filter(e => e.trim() !== email));
                            }}>
                                <X className="h-3 w-3"/>
                            </button>
                        </Badge>
                    )
                })}
              </div>
              <Command className="rounded-lg border shadow-md">
                <CommandInput placeholder="Search contacts..." />
                <CommandList>
                  <CommandEmpty>No contacts found.</CommandEmpty>
                  <ScrollArea className="h-[150px]">
                  <CommandGroup>
                    {contactsLoading ? (
                      <CommandItem>Loading...</CommandItem>
                    ) : (
                      contacts?.map(contact => (
                        <CommandItem
                          key={contact.id}
                          onSelect={() => handleContactSelect(contact.email, !selectedInvitees.includes(contact.email))}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                             <Checkbox
                                id={`contact-${contact.id}`}
                                checked={selectedInvitees.includes(contact.email)}
                                onCheckedChange={(checked) => handleContactSelect(contact.email, !!checked)}
                             />
                            <div>
                                <p>{contact.name}</p>
                                <p className="text-xs text-muted-foreground">{contact.email} {contact.designation && `(${contact.designation})`}</p>
                            </div>
                          </div>
                        </CommandItem>
                      ))
                    )}
                  </CommandGroup>
                  </ScrollArea>
                </CommandList>
              </Command>
              
              <div className="space-y-2 pt-4">
                <Label className="text-sm font-medium">Add Manually</Label>
                {manualInvitees.map((email, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => handleManualInviteeChange(index, e.target.value)}
                      className="flex-1"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeManualInviteeField(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addManualInviteeField}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Another Email
                </Button>
              </div>
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
