'use client';

import { useState, useMemo, useCallback } from 'react';
import { GitBranch, Calendar as CalendarIcon, Clock, Globe, FileSignature, Hourglass, Video, Eye } from 'lucide-react';
import { ProcessTimeline } from '@/components/process-timeline';
import { ProcessStatusBadge } from '@/components/process-status-badge';
import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data-context';
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
  const { currentUser } = useAuth();
  const { selectionProcesses, interviewRequests, setProcessStage, getApplicantById, getAvailabilityForApplicant, initiateContract, requestContractApproval, contractApprovalRequests, employerProfiles, createIntroMeeting } = useData();
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [schedulingProcess, setSchedulingProcess] = useState<SelectionProcess | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [contractProcess, setContractProcess] = useState<SelectionProcess | null>(null);
  const [introMeetProcess, setIntroMeetProcess] = useState<SelectionProcess | null>(null);
  const [isCreatingMeet, setIsCreatingMeet] = useState(false);

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
    ? employerProfiles.find((e) => e.id === currentUser.employer_profile_id)
    : undefined;

  const employerId = employerProfile?.id ?? '';

  const processes = useMemo(
    () => selectionProcesses.filter((p) => p.employer_id === employerId),
    [selectionProcesses, employerId]
  );

  const filteredProcesses = useMemo(() => {
    const statusFilter = tabToStatus(activeTab);
    if (!statusFilter) return processes;
    return processes.filter((p) => p.status === statusFilter);
  }, [processes, activeTab]);

  const hasApprovalPending = useCallback(
    (process: SelectionProcess) => contractApprovalRequests.some(
      (r) => r.process_id === process.id && r.status === 'pending'
    ),
    [contractApprovalRequests]
  );

  const hasPendingForProcess = useCallback(
    (process: SelectionProcess) => interviewRequests.some(
      (r) =>
        r.applicant_id === process.applicant_id &&
        r.employer_id === process.employer_id &&
        r.status === 'pending' &&
        r.role_title === `Technical Interview - ${process.role_title}`
    ),
    [interviewRequests]
  );

  const handleStageClick = useCallback((process: SelectionProcess, stageKey: string) => {
    if (stageKey === 'technical_interview' && interviewRequests.some(
      (r) => r.applicant_id === process.applicant_id && r.employer_id === process.employer_id && r.status === 'pending' && r.role_title === `Technical Interview - ${process.role_title}`
    )) return;
    if (stageKey === 'contract_signing') {
      setContractProcess(process);
    } else {
      setSchedulingProcess(process);
      setSelectedDate(undefined);
      setSelectedTimeSlot('');
    }
  }, [interviewRequests]);

  const handleCreateIntroMeet = useCallback((process: SelectionProcess) => {
    setIntroMeetProcess(process);
  }, []);

  const handleConfirmIntroMeet = useCallback(async () => {
    if (!introMeetProcess) return;
    setIsCreatingMeet(true);
    try {
      await createIntroMeeting(introMeetProcess.id);
    } finally {
      setIsCreatingMeet(false);
      setIntroMeetProcess(null);
    }
  }, [introMeetProcess, createIntroMeeting]);

  const handleInitiateContract = useCallback(() => {
    if (!contractProcess) return;
    requestContractApproval(contractProcess.id);
    setContractProcess(null);
  }, [contractProcess, requestContractApproval]);

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

                {hasApprovalPending(process) && (
                  <div className="flex items-center gap-1.5 mb-3 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                    <Hourglass className="w-3.5 h-3.5" />
                    Awaiting Admin Approval
                  </div>
                )}

                {hasPendingForProcess(process) && (
                  <div className="flex items-center gap-1.5 mb-3 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                    <Hourglass className="w-3.5 h-3.5" />
                    Awaiting candidate response
                  </div>
                )}

                <div className="mb-4">
                  <ProcessTimeline
                    currentStage={process.current_stage as 'intro_interview' | 'technical_interview' | 'contract_signing'}
                    status={process.status as 'active' | 'hired' | 'not_selected' | 'on_hold'}
                    introDate={process.intro_interview_date}
                    technicalDate={process.technical_interview_date}
                    contractStatus={process.contract_status as 'pending' | 'under_review' | 'signed' | null}
                    meetingUrl={process.meeting_url}
                    introMeetingUrl={process.current_stage === 'intro_interview' ? (process.meeting_url ?? null) : null}
                    onStageClick={(stageKey) => handleStageClick(process, stageKey)}
                    onCreateIntroMeet={process.current_stage === 'intro_interview' && !process.meeting_url ? () => handleCreateIntroMeet(process) : undefined}
                    isCreatingMeet={isCreatingMeet && introMeetProcess?.id === process.id}
                  />
                </div>

                {process.current_stage === 'contract_signing' && process.contract_status === 'signed' && process.contract_url && (
                  <div className="mb-3 flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open(process.contract_url!, '_blank')}>
                      <Eye className="w-4 h-4" />
                      View Contract
                    </Button>
                    <span className="text-xs text-emerald-600 font-medium">Finalized</span>
                  </div>
                )}

                {process.notes && (
                  <p className="text-sm text-muted-foreground mb-2">
                    <span className="font-medium text-foreground">Notes:</span> {process.notes}
                  </p>
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
                    {DAY_NAMES[slot.day_of_week % 7]}: {slot.start_time.split(':').slice(0, 2).join(':')} - {slot.end_time.split(':').slice(0, 2).join(':')}
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
                <>An approval request will be sent to the administrator to initiate contract signing for {getApplicantById(contractProcess.applicant_id)?.display_name || 'the candidate'} for {contractProcess.role_title}.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-4">
            <FileSignature className="w-8 h-8 text-blue-600" />
            <p className="text-sm text-blue-800">
              A request for approval will be sent to the admin. The process will advance only after admin approval.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleInitiateContract} className="gap-2">
              <FileSignature className="w-4 h-4" />
              Send Approval Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!introMeetProcess} onOpenChange={(open) => { if (!open && !isCreatingMeet) setIntroMeetProcess(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Intro Interview Meeting</DialogTitle>
            <DialogDescription>
              {introMeetProcess && (
                <>A Zoom/Meet link will be generated via n8n for the intro interview with {getApplicantById(introMeetProcess.applicant_id)?.display_name || 'the candidate'} for {introMeetProcess.role_title}. Both you and the candidate will receive the link.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-4">
            <Video className="w-8 h-8 text-blue-600" />
            <p className="text-sm text-blue-800">
              The meeting link will be sent to both the employer and applicant via notifications and will appear as a join button on the timeline.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={isCreatingMeet}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleConfirmIntroMeet} disabled={isCreatingMeet} className="gap-2">
              {isCreatingMeet ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Video className="w-4 h-4" />
              )}
              {isCreatingMeet ? 'Creating...' : 'Create Meeting'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
