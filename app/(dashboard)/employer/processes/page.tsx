'use client';

import { useState, useMemo, useCallback } from 'react';
import { GitBranch, Calendar as CalendarIcon, Clock, Globe, FileSignature, Video } from 'lucide-react';
import { ProcessTimeline } from '@/components/process-timeline';
import { ProcessStatusBadge } from '@/components/process-status-badge';
import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { useDemoAuth } from '@/lib/demo-auth';
import { useMockData } from '@/lib/data-context';
import { mockEmployerProfiles } from '@/data/mock';
import type { SelectionProcess } from '@/types';
import { format } from 'date-fns';

const filterTabs = ['All', 'Active', 'Hired', 'On Hold', 'Not Selected'] as const;
type FilterTab = typeof filterTabs[number];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function tabToStatus(tab: FilterTab): string | null {
  if (tab === 'All') return null;
  if (tab === 'On Hold') return 'on_hold';
  if (tab === 'Not Selected') return 'not_selected';
  return tab.toLowerCase();
}

export default function EmployerProcessesPage() {
  const { currentUser } = useDemoAuth();
  const { selectionProcesses, setProcessStage, getApplicantById, getAvailabilityForApplicant, initiateContract } = useMockData();
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [schedulingProcess, setSchedulingProcess] = useState<SelectionProcess | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [contractProcess, setContractProcess] = useState<SelectionProcess | null>(null);

  const schedulingApplicant = schedulingProcess ? getApplicantById(schedulingProcess.applicant_id) : null;
  const schedulingSlots = schedulingApplicant
    ? getAvailabilityForApplicant(schedulingApplicant.id)
    : [];
  const schedulingTimezone = schedulingApplicant?.timezone || 'America/Bogota';

  const slotsForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    const dayOfWeek = selectedDate.getDay();
    return schedulingSlots.filter((s) => (s.day_of_week % 7) === dayOfWeek);
  }, [selectedDate, schedulingSlots]);

  const employerProfile = currentUser?.employer_profile_id
    ? mockEmployerProfiles.find((e) => e.id === currentUser.employer_profile_id)
    : mockEmployerProfiles[0];

  const employerId = employerProfile?.id || 'ep-acme';

  const processes = useMemo(
    () => selectionProcesses.filter((p) => p.employer_id === employerId),
    [selectionProcesses, employerId]
  );

  const filteredProcesses = useMemo(() => {
    const statusFilter = tabToStatus(activeTab);
    if (!statusFilter) return processes;
    return processes.filter((p) => p.status === statusFilter);
  }, [processes, activeTab]);

  const handleStageClick = useCallback((process: SelectionProcess, stageKey: string) => {
    if (stageKey === 'contract_signing') {
      setContractProcess(process);
    } else {
      setSchedulingProcess(process);
      setSelectedDate(undefined);
      setSelectedTimeSlot('');
    }
  }, []);

  const handleInitiateContract = useCallback(() => {
    if (!contractProcess) return;
    initiateContract(contractProcess.id);
    setContractProcess(null);
  }, [contractProcess, initiateContract]);

  const handleSchedule = useCallback(() => {
    if (!schedulingProcess || !selectedDate || !selectedTimeSlot) return;
    const [startTime] = selectedTimeSlot.split(' - ');
    const dateStr = `${format(selectedDate, 'yyyy-MM-dd')}T${startTime}:00`;
    setProcessStage(schedulingProcess.id, 'technical_interview', dateStr);
    setSchedulingProcess(null);
    setSelectedDate(undefined);
    setSelectedTimeSlot('');
  }, [schedulingProcess, selectedDate, selectedTimeSlot, setProcessStage]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Selection Processes</h2>
        <p className="text-muted-foreground mt-1">
          Track and manage your active hiring pipelines.
        </p>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filteredProcesses.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title="No processes found"
          description={
            activeTab === 'All'
              ? 'You have no selection processes yet. Start by browsing applicants and sending interview requests.'
              : `No processes with "${activeTab}" status.`
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredProcesses.map((process) => {
            const applicant = getApplicantById(process.applicant_id);
            return (
              <div
                key={process.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {applicant && (
                      <img
                        src={applicant.profile_image_url || ''}
                        alt={applicant.display_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {applicant?.display_name || 'Unknown Applicant'}
                      </h3>
                      <p className="text-sm text-muted-foreground">{process.role_title}</p>
                    </div>
                  </div>
                  <ProcessStatusBadge status={process.status} />
                </div>

                <div className="mb-4">
                  <ProcessTimeline
                    currentStage={process.current_stage as 'intro_interview' | 'technical_interview' | 'contract_signing'}
                    status={process.status as 'active' | 'hired' | 'not_selected' | 'on_hold'}
                    introDate={process.intro_interview_date}
                    technicalDate={process.technical_interview_date}
                    contractStatus={process.contract_status as 'pending' | 'under_review' | 'signed' | null}
                    onStageClick={(stageKey) => handleStageClick(process, stageKey)}
                  />
                </div>

                {process.notes && (
                  <p className="text-sm text-muted-foreground mb-2">
                    <span className="font-medium text-foreground">Notes:</span> {process.notes}
                  </p>
                )}
                {process.meeting_url && (
                  <a
                    href={process.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 mb-2"
                  >
                    <Video className="w-4 h-4" />
                    Join Zoom Meeting
                  </a>
                )}
                <p className="text-xs text-muted-foreground">
                  Started{' '}
                  {new Date(process.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!schedulingProcess} onOpenChange={(open) => { if (!open) { setSchedulingProcess(null); setSelectedTimeSlot(''); } }}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule Technical Interview</DialogTitle>
            <DialogDescription>
              {schedulingProcess && (
                <>Select a date and time slot for the technical interview with {getApplicantById(schedulingProcess.applicant_id)?.display_name || 'the candidate'} for {schedulingProcess.role_title}.</>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Availability badges */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Available Slots ({schedulingTimezone})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {schedulingSlots.length === 0 ? (
                <p className="text-xs text-muted-foreground">No availability slots set.</p>
              ) : (
                schedulingSlots.map((slot) => (
                  <Badge key={slot.id} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {DAY_NAMES[slot.day_of_week % 7]}: {slot.start_time} - {slot.end_time}
                  </Badge>
                ))
              )}
            </div>
          </div>

          {/* Calendar */}
          <div className="flex justify-center py-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(day) => { setSelectedDate(day); setSelectedTimeSlot(''); }}
              disabled={(day) => {
                const dayOfWeek = day.getDay();
                return !schedulingSlots.some((s) => (s.day_of_week % 7) === dayOfWeek);
              }}
              className="rounded-lg border border-gray-200"
            />
          </div>

          {/* Time slots for selected day */}
          {selectedDate && slotsForSelectedDay.length > 0 && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Select Time Slot <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {slotsForSelectedDay.flatMap((slot) => {
                  const times = [];
                  const [startH, startM] = slot.start_time.split(':').map(Number);
                  const [endH, endM] = slot.end_time.split(':').map(Number);
                  const startMinutes = startH * 60 + startM;
                  const endMinutes = endH * 60 + endM;
                  for (let m = startMinutes; m + 60 <= endMinutes; m += 60) {
                    const from = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
                    const to = `${String(Math.floor((m + 60) / 60)).padStart(2, '0')}:${String((m + 60) % 60).padStart(2, '0')}`;
                    const label = `${from} - ${to}`;
                    times.push(
                      <button
                        key={label}
                        onClick={() => setSelectedTimeSlot(label)}
                        className={`px-3 py-2 rounded-lg text-sm border text-left transition-colors ${
                          selectedTimeSlot === label
                            ? 'bg-[hsl(210,100%,45%)] text-white border-[hsl(210,100%,45%)]'
                            : 'bg-white text-foreground border-gray-200 hover:border-[hsl(210,100%,45%)]'
                        }`}
                      >
                        {from} - {to}
                      </button>
                    );
                  }
                  return times;
                })}
              </div>
            </div>
          )}

          {selectedDate && (
            <p className="text-sm text-center text-muted-foreground">
              Selected: <span className="font-medium text-foreground">{format(selectedDate, 'PPP')}</span>
              {selectedTimeSlot && <> at <span className="font-medium text-foreground">{selectedTimeSlot}</span></>}
            </p>
          )}

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSchedule} disabled={!selectedDate || !selectedTimeSlot}>
              Schedule Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!contractProcess} onOpenChange={(open) => { if (!open) setContractProcess(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Initiate Contract Signing</DialogTitle>
            <DialogDescription>
              {contractProcess && (
                <>Proceed with contract signing for {getApplicantById(contractProcess.applicant_id)?.display_name || 'the candidate'} for {contractProcess.role_title}? The candidate will be notified and the admin will be prompted to upload the contract.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-4">
            <FileSignature className="w-8 h-8 text-blue-600" />
            <p className="text-sm text-blue-800">
              This will advance the process to the Contract Signing stage. The candidate will receive a notification to review the contract.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleInitiateContract} className="gap-2">
              <FileSignature className="w-4 h-4" />
              Initiate Contract
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
