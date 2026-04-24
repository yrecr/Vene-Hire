'use client';

import { useState, useMemo } from 'react';
import { Clock, Plus, Trash2, Save } from 'lucide-react';
import { useDemoAuth } from '@/lib/demo-auth';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockTalentProfiles, mockAvailabilitySlots, demoUsers } from '@/data/mock';
import type { AvailabilitySlot } from '@/types';

const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Bogota',
  'America/Caracas',
  'America/Lima',
  'America/Santiago',
  'America/Buenos_Aires',
  'America/Mexico_City',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Madrid',
  'UTC',
];

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const generalAvailabilityOptions = [
  'Available Immediately',
  'In 2 Weeks',
  'In 1 Month',
  'Not Available',
];

const timeSlots = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00',
];

export default function ApplicantAvailabilityPage() {
  const { currentUser } = useDemoAuth();
  const user = currentUser ?? demoUsers.find(function (u) { return u.role === 'applicant'; }) ?? null;

  const talentProfile = useMemo(function () {
    if (!user?.talent_profile_id) return null;
    return mockTalentProfiles.find(function (t) { return t.id === user.talent_profile_id; }) || null;
  }, [user]);

  const initialSlots = useMemo(function () {
    if (!talentProfile) return [];
    return mockAvailabilitySlots.filter(function (s) { return s.applicant_id === talentProfile.id; });
  }, [talentProfile]);

  const [timezone, setTimezone] = useState(talentProfile?.timezone || 'America/Bogota');
  const [generalAvailability, setGeneralAvailability] = useState('Available Immediately');
  const [slots, setSlots] = useState<AvailabilitySlot[]>(initialSlots);
  const [newDay, setNewDay] = useState('1');
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('12:00');
  const [saved, setSaved] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Please sign in</h2>
          <p className="text-muted-foreground">Sign in with an applicant account to manage your availability.</p>
        </div>
      </div>
    );
  }

  function handleAddSlot() {
    var newSlot: AvailabilitySlot = {
      id: 'as-new-' + Date.now(),
      applicant_id: talentProfile?.id || '',
      day_of_week: parseInt(newDay, 10),
      start_time: newStart,
      end_time: newEnd,
      timezone: timezone,
    };
    setSlots(function (prev) { return prev.concat([newSlot]); });
  }

  function handleDeleteSlot(slotId: string) {
    setSlots(function (prev) { return prev.filter(function (s) { return s.id !== slotId; }); });
  }

  function handleSave() {
    setSaved(true);
    setTimeout(function () { setSaved(false); }, 3000);
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Availability</h2>
        <p className="text-muted-foreground mt-1">
          Set your availability so employers know when you can interview and start working.
        </p>
      </div>

      {/* Save feedback */}
      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">
          Availability saved successfully! (Demo mode - changes are not persisted)
        </div>
      )}

      {/* Timezone */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">Timezone</h3>
        <div className="max-w-sm">
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger>
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {timezones.map(function (tz) {
                return (
                  <SelectItem key={tz} value={tz}>
                    {tz.replace(/_/g, ' ')}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* General Availability */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">General Availability</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {generalAvailabilityOptions.map(function (option) {
            var isSelected = generalAvailability === option;
            return (
              <button
                key={option}
                type="button"
                onClick={function () { setGeneralAvailability(option); }}
                className={
                  'flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ' +
                  (isSelected
                    ? 'border-[hsl(210,100%,45%)] bg-[hsl(210,100%,45%)]/5'
                    : 'border-gray-200 hover:border-gray-300')
                }
              >
                <div
                  className={
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center ' +
                    (isSelected ? 'border-[hsl(210,100%,45%)]' : 'border-gray-300')
                  }
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-[hsl(210,100%,45%)]" />
                  )}
                </div>
                <span className={
                  'text-sm font-medium ' +
                  (isSelected ? 'text-[hsl(210,100%,45%)]' : 'text-foreground')
                }>
                  {option}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">Weekly Schedule</h3>

        {/* Schedule Grid */}
        <div className="space-y-3 mb-6">
          {dayNames.map(function (dayName, index) {
            var dayNum = index + 1;
            var daySlots = slots.filter(function (s) { return s.day_of_week === dayNum; });
            return (
              <div key={dayName} className="flex items-start gap-4 py-2">
                <span className="text-sm font-medium text-foreground w-24 pt-1 shrink-0">
                  {dayName}
                </span>
                <div className="flex-1">
                  {daySlots.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {daySlots.map(function (slot) {
                        return (
                          <div
                            key={slot.id}
                            className="flex items-center gap-2 bg-[hsl(210,100%,45%)]/5 border border-[hsl(210,100%,45%)]/20 rounded-lg px-3 py-1.5"
                          >
                            <Clock className="w-3.5 h-3.5 text-[hsl(210,100%,45%)]" />
                            <span className="text-sm text-foreground">
                              {slot.start_time} - {slot.end_time}
                            </span>
                            <button
                              type="button"
                              onClick={function () { handleDeleteSlot(slot.id); }}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground italic pt-1">No slots</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Slot */}
        <div className="border-t border-gray-100 pt-5">
          <h4 className="text-sm font-semibold text-foreground mb-3">Add Time Slot</h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div className="space-y-2">
              <Label>Day</Label>
              <Select value={newDay} onValueChange={setNewDay}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dayNames.map(function (name, index) {
                    return (
                      <SelectItem key={name} value={String(index + 1)}>
                        {name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Select value={newStart} onValueChange={setNewStart}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(function (time) {
                    return (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Select value={newEnd} onValueChange={setNewEnd}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(function (time) {
                    return (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddSlot} className="gap-2">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Save */}
      <div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Save Availability
        </Button>
      </div>
    </div>
  );
}
