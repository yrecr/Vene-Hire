'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { useData } from '@/lib/data-context';
import type { TalentProfile } from '@/types';
import { Calendar as CalendarIcon, Clock, Globe } from 'lucide-react';
import { format } from 'date-fns';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface InterviewRequestModalProps {
  applicant: TalentProfile;
  employerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InterviewRequestModal({
  applicant,
  employerId,
  open,
  onOpenChange,
}: InterviewRequestModalProps) {
  const { createInterviewRequest, getAvailabilityForApplicant } = useData();
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [roleTitle, setRoleTitle] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const availabilitySlots = useMemo(
    () => getAvailabilityForApplicant(applicant.id),
    [getAvailabilityForApplicant, applicant.id]
  );

  const userTimezone = applicant.timezone || 'America/Bogota';

  const slotsForSelectedDay = useMemo(() => {
    if (!date) return [];
    const dayOfWeek = date.getDay();
    return availabilitySlots.filter((s) => (s.day_of_week % 7) === dayOfWeek);
  }, [date, availabilitySlots]);

  async function handleSubmit() {
    if (!date || !timeSlot || !roleTitle.trim()) return;
    const [startTime] = timeSlot.split(' - ');
    const timePart = startTime.split(':').length === 2 ? `${startTime}:00` : startTime;
    const dateTimeStr = `${format(date, 'yyyy-MM-dd')}T${timePart}`;
    try {
      await createInterviewRequest({
        applicant_id: applicant.id,
        employer_id: employerId,
        role_title: roleTitle.trim(),
        requested_date: dateTimeStr,
        message: message.trim() || `Interview request for ${roleTitle.trim()} position.`,
      });
      setSubmitted(true);
    } catch {
      setSubmitError('Failed to send request. Please try again.');
    }
  }

  function handleClose() {
    const wasSubmitted = submitted;
    setSubmitted(false);
    setSubmitError(null);
    setDate(undefined);
    setTimeSlot('');
    setRoleTitle('');
    setMessage('');
    onOpenChange(false);
    if (wasSubmitted) {
      router.push('/employer/requests');
    }
  }

  function handleCalendarSelect(day: Date | undefined) {
    setDate(day);
    setTimeSlot('');
  }

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Request Sent!</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-muted-foreground">
              Your interview request has been sent to {applicant.display_name}. They will review it and respond.
            </p>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button onClick={handleClose}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Interview</DialogTitle>
          <DialogDescription>
            Schedule an interview with {applicant.display_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Applicant info */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
            <img
              src={applicant.profile_image_url || ''}
              alt={applicant.display_name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-foreground">{applicant.display_name}</p>
              <p className="text-sm text-muted-foreground">{applicant.title}</p>
            </div>
          </div>

          {/* Role title */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Role Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)]"
            />
          </div>

          {/* Availability info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Available Slots ({userTimezone})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {availabilitySlots.length === 0 ? (
                <p className="text-xs text-muted-foreground">No availability slots set.</p>
              ) : (
                availabilitySlots.map((slot) => (
                  <Badge key={slot.id} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {DAY_NAMES[slot.day_of_week % 7]}: {slot.start_time.split(':').slice(0, 2).join(':')} - {slot.end_time.split(':').slice(0, 2).join(':')}
                  </Badge>
                ))
              )}
            </div>
          </div>

          {/* Date picker */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Select Date <span className="text-red-500">*</span>
            </label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleCalendarSelect}
              disabled={(day) => {
                const dayOfWeek = day.getDay();
                return !availabilitySlots.some((s) => (s.day_of_week % 7) === dayOfWeek);
              }}
              className="rounded-lg border border-gray-200"
            />
          </div>

          {/* Time slots */}
          {slotsForSelectedDay.length > 0 && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Select Time <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {slotsForSelectedDay.map((slot) => {
                  const option = `${slot.start_time} - ${slot.end_time}`;
                  return (
                    <button
                      key={slot.id}
                      onClick={() => setTimeSlot(option)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        timeSlot === option
                          ? 'bg-[hsl(210,100%,45%)] text-white border-[hsl(210,100%,45%)]'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <CalendarIcon className="w-3.5 h-3.5 inline mr-1.5" />
                      {slot.start_time} - {slot.end_time}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          {/* Message */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message to the candidate..."
              rows={3}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)] resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={!date || !timeSlot || !roleTitle.trim()}
          >
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
