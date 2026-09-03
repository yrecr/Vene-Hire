'use client';

import { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import type {
  TalentProfile, InterviewRequest, SelectionProcess, Notification, AvailabilitySlot,
  EmployerProfile, Profile, AccessRequest, TalentSkill, Bootcamp, Enrollment, Resource,
  ContractApprovalRequest, Vacancy, Candidate, Timesheet, TimesheetDay, TimesheetEvent,
} from '@/types';
import * as api from './supabase-service';
import { mockEmployerProfiles } from '@/data/mock';

interface NewInterviewData {
  applicant_id: string;
  employer_id: string;
  role_title: string;
  requested_date: string;
  message: string;
}

interface DataContextType {
  isHydrated: boolean;
  talentProfiles: (TalentProfile & { skills: TalentSkill[] })[];
  profiles: Profile[];
  employerProfiles: EmployerProfile[];
  accessRequests: AccessRequest[];
  interviewRequests: InterviewRequest[];
  selectionProcesses: SelectionProcess[];
  notifications: Notification[];
  shortlistedIds: string[];
  availabilitySlots: AvailabilitySlot[];
  bootcamps: Bootcamp[];
  enrollments: Enrollment[];
  resources: Resource[];
  createResource: (formData: FormData) => Promise<void>;
  updateResourceVisibility: (id: string, visibility: Resource['visibility']) => Promise<void>;
  vacancies: Vacancy[];
  candidates: Candidate[];
  createVacancy: (v: Vacancy) => Promise<void>;
  updateCandidateStatus: (candidateId: string, status: Candidate['manual_status']) => Promise<void>;
  createInterviewRequest: (data: NewInterviewData) => void;
  respondToInterview: (requestId: string, status: 'accepted' | 'declined') => void;
  setProcessStage: (processId: string, stage: 'technical_interview', date: string) => void;
  updateProcessStatus: (processId: string, status: 'active' | 'on_hold' | 'not_selected') => Promise<void>;
  updateProcessHourlyRate: (processId: string, hourlyRate: number) => Promise<void>;
  timesheets: Timesheet[];
  timesheetEvents: TimesheetEvent[];
  submitTimesheet: (processId: string, month: string, days: TimesheetDay[]) => Promise<void>;
  reviewTimesheet: (timesheetId: string, decision: 'approved' | 'rejected', comment?: string) => Promise<void>;
  addMeetingLink: (requestId: string, url: string) => void;
  reportInterviewOutcome: (requestId: string, outcome: 'passed' | 'failed', notes: string) => void;
  toggleShortlist: (applicantId: string) => Promise<void>;
  updateAccessRequestStatus: (id: string, status: AccessRequest['status']) => Promise<void>;
  isShortlisted: (applicantId: string) => boolean;
  getAvailabilityForApplicant: (applicantId: string) => AvailabilitySlot[];
  getNotificationsForUser: (userId: string) => Notification[];
  getApplicantById: (id: string) => (TalentProfile & { skills: TalentSkill[] }) | undefined;
  getEmployerById: (id: string) => EmployerProfile | undefined;
  updateAvailabilitySlots: (applicantId: string, slots: AvailabilitySlot[]) => void;
  contractApprovalRequests: ContractApprovalRequest[];
  initiateContract: (processId: string) => void;
  requestContractApproval: (processId: string) => void;
  approveContractRequest: (requestId: string, processId: string) => void;
  rejectContractRequest: (requestId: string, processId: string) => void;
  uploadContract: (processId: string) => void;
  signContract: (processId: string, signatureBlob: Blob) => Promise<void>;
  verifyContract: (processId: string) => Promise<void>;
  getProcessById: (processId: string) => SelectionProcess | undefined;
  refreshAll: () => Promise<void>;
  setAccessRequests: (updater: AccessRequest[] | ((prev: AccessRequest[]) => AccessRequest[])) => void;
  setProfiles: (list: Profile[]) => void;
  updateTalentProfile: (profile: TalentProfile & { skills: TalentSkill[] }) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [interviewRequests, setInterviewRequests] = useState<InterviewRequest[]>([]);
  const [selectionProcesses, setSelectionProcesses] = useState<SelectionProcess[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [talentProfiles, setTalentProfiles] = useState<(TalentProfile & { skills: TalentSkill[] })[]>([]);
  const [profiles, setProfilesState] = useState<Profile[]>([]);
  const [employerProfiles, setEmployerProfiles] = useState<EmployerProfile[]>(mockEmployerProfiles);
  const [accessRequests, setAccessRequestsState] = useState<AccessRequest[]>([]);
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [contractApprovalRequests, setContractApprovalRequests] = useState<ContractApprovalRequest[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [timesheetEvents, setTimesheetEvents] = useState<TimesheetEvent[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const hydrateFromSupabase = useCallback(async () => {
    try {
      const [tp, p, ep, ar, ir, sp, n, av, bc, en, re, car, vac, cand, sl, ts, te] = await Promise.allSettled([
        api.fetchTalentProfiles(),
        api.fetchProfiles(),
        api.fetchEmployerProfiles(),
        api.fetchAccessRequests(),
        api.fetchInterviewRequests(),
        api.fetchSelectionProcesses(),
        api.fetchNotifications(),
        api.fetchAvailabilitySlots(),
        api.fetchBootcamps(),
        api.fetchEnrollments(),
        api.fetchResources(),
        api.fetchContractApprovalRequests(),
        api.fetchVacancies(),
        api.fetchCandidates(),
        api.fetchShortlistedIds(),
        api.fetchTimesheets(),
        api.fetchTimesheetEvents(),
      ]);

      // Replace seed data with real Supabase data to avoid duplicates
      if (tp.status === 'fulfilled' && tp.value.length) setTalentProfiles(tp.value);
      if (av.status === 'fulfilled' && av.value.length) setAvailabilitySlots(av.value);
      if (p.status === 'fulfilled' && p.value.length) setProfilesState(p.value);
      if (ep.status === 'fulfilled' && ep.value.length) setEmployerProfiles(ep.value);
      if (ar.status === 'fulfilled' && ar.value.length) setAccessRequestsState(ar.value);
      if (ir.status === 'fulfilled' && ir.value.length) setInterviewRequests(ir.value);
      if (sp.status === 'fulfilled' && sp.value.length) setSelectionProcesses(sp.value);
      if (n.status === 'fulfilled' && n.value.length) setNotifications(n.value);
      if (bc.status === 'fulfilled' && bc.value.length) setBootcamps(bc.value);
      if (en.status === 'fulfilled' && en.value.length) setEnrollments(en.value);
      if (re.status === 'fulfilled' && re.value.length) setResources(re.value);
      if (car.status === 'fulfilled' && car.value.length) setContractApprovalRequests(car.value);
      if (vac.status === 'fulfilled' && vac.value.length) setVacancies(vac.value);
      if (cand.status === 'fulfilled' && cand.value.length) setCandidates(cand.value);
      if (sl.status === 'fulfilled' && sl.value.length) setShortlistedIds(sl.value);
      if (ts.status === 'fulfilled' && ts.value.length) setTimesheets(ts.value);
      if (te.status === 'fulfilled' && te.value.length) setTimesheetEvents(te.value);
    } catch {
      // Supabase unavailable
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => { hydrateFromSupabase(); }, [hydrateFromSupabase]);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      hydrateFromSupabase();
    });
    return () => subscription.unsubscribe();
  }, [hydrateFromSupabase]);

  const findTalentById = useCallback((id: string) => {
    return talentProfiles.find((t) => t.id === id);
  }, [talentProfiles]);

  const findEmployer = useCallback((id: string | null | undefined) => {
    if (!id) return undefined;
    return employerProfiles.find((e) => e.id === id);
  }, [employerProfiles]);

  const findEmployerUserId = useCallback((employerId: string) => {
    const ep = findEmployer(employerId);
    return ep?.user_id;
  }, [employerProfiles, findEmployer]);

  const createInterviewRequest = useCallback(async (data: NewInterviewData) => {
    const newRequest: InterviewRequest = {
      id: crypto.randomUUID(),
      applicant_id: data.applicant_id,
      employer_id: data.employer_id,
      role_title: data.role_title,
      requested_date: data.requested_date,
      status: 'pending',
      message: data.message,
      created_at: new Date().toISOString(),
      meeting_url: null,
    };
    setInterviewRequests((prev) => [...prev, newRequest]);
    try {
      await api.upsertInterviewRequest(newRequest);
    } catch {
      setInterviewRequests((prev) => prev.filter((r) => r.id !== newRequest.id));
      throw new Error('Failed to save interview request');
    }

    const applicant = findTalentById(data.applicant_id);
    const employer = findEmployer(data.employer_id);

    // NOTE: Zoom meeting is created when the applicant *accepts* (see respondToInterview),
    // not at request-creation time, so n8n is triggered at the right moment.

    const applicantUserId = applicant?.user_id;
    if (applicantUserId) {
      const n1: Notification = {
        id: crypto.randomUUID(), user_id: applicantUserId,
        title: 'New Interview Request',
        message: `${employer?.company_name || 'An employer'} wants to schedule an interview for ${data.role_title}.`,
        type: 'interview', read: false, created_at: new Date().toISOString(),
      };
      setNotifications((prev) => [...prev, n1]);
      api.upsertNotification(n1).catch(() => {});
    }
    const empUserId = findEmployerUserId(data.employer_id);
    if (empUserId) {
      const n2: Notification = {
        id: crypto.randomUUID(), user_id: empUserId,
        title: 'Interview Request Sent',
        message: `Your interview request to ${applicant?.display_name || 'candidate'} for ${data.role_title} has been sent.`,
        type: 'interview', read: false, created_at: new Date().toISOString(),
      };
      setNotifications((prev) => [...prev, n2]);
      api.upsertNotification(n2).catch(() => {});
    }
  }, [findTalentById, findEmployer, findEmployerUserId]);

  const respondToInterview = useCallback((requestId: string, status: 'accepted' | 'declined') => {
    setInterviewRequests((prev) => prev.map((req) => req.id === requestId ? { ...req, status } : req));
    const request = interviewRequests.find((r) => r.id === requestId);
    if (request) {
      api.upsertInterviewRequest({ ...request, status }).catch(() => {});
    }
    if (status === 'accepted' && request) {
      const isTechnical = request.role_title.startsWith('Technical Interview - ');
      const existingProcess = !isTechnical ? null : selectionProcesses.find(
        (p) => p.applicant_id === request.applicant_id && p.employer_id === request.employer_id
      );
      const processId = crypto.randomUUID();
      if (!existingProcess) {
        const newProcess: SelectionProcess = {
          id: processId,
          applicant_id: request.applicant_id, employer_id: request.employer_id,
          role_title: request.role_title, current_stage: 'intro_interview', status: 'active',
          intro_interview_date: request.requested_date, technical_interview_date: null,
          meeting_url: null, contract_status: null, contract_url: null, signature_url: null,
          hourly_rate: null,
          notes: 'Process started from interview request acceptance.',
          created_at: new Date().toISOString(),
        };
        setSelectionProcesses((prev) => [...prev, newProcess]);
        api.upsertSelectionProcess(newProcess).catch(() => {});
      }
      const applicant = findTalentById(request.applicant_id);
      const employer = findEmployer(request.employer_id);
      const uid_app = applicant?.user_id;
      if (uid_app) {
        const n: Notification = {
          id: crypto.randomUUID(), user_id: uid_app,
          title: existingProcess ? 'Technical Interview Accepted' : 'Interview Accepted',
          message: existingProcess ? `You accepted the technical interview with ${employer?.company_name || 'employer'} for ${request.role_title}.` : `You accepted the interview with ${employer?.company_name || 'employer'}. The employer will share a meeting link shortly.`,
          type: 'interview', read: false, created_at: new Date().toISOString(),
        };
        setNotifications((prev) => [...prev, n]);
        api.upsertNotification(n).catch(() => {});
      }
      const empUserId = findEmployerUserId(request.employer_id);
      if (empUserId) {
        const n: Notification = {
          id: crypto.randomUUID(), user_id: empUserId,
          title: existingProcess ? 'Technical Interview Accepted' : 'Interview Accepted',
          message: existingProcess ? `${applicant?.display_name || 'Applicant'} accepted the technical interview.` : `${applicant?.display_name || 'Applicant'} accepted your interview request. Add a meeting link from Interview Requests.`,
          type: 'process', read: false, created_at: new Date().toISOString(),
        };
        setNotifications((prev) => [...prev, n]);
        api.upsertNotification(n).catch(() => {});
      }
    } else if (status === 'declined' && request) {
      const applicant = findTalentById(request.applicant_id);
      const empUserId = findEmployerUserId(request.employer_id);
      if (empUserId) {
        const n: Notification = {
          id: crypto.randomUUID(), user_id: empUserId,
          title: 'Interview Declined',
          message: `${applicant?.display_name || 'Applicant'} declined your interview request.`,
          type: 'interview', read: false, created_at: new Date().toISOString(),
        };
        setNotifications((prev) => [...prev, n]);
        api.upsertNotification(n).catch(() => {});
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewRequests, selectionProcesses, findTalentById, findEmployer, findEmployerUserId]);

  const setProcessStage = useCallback((processId: string, stage: 'technical_interview', date: string) => {
    setSelectionProcesses((prev) => prev.map((p) =>
      p.id === processId ? { ...p, current_stage: stage, technical_interview_date: date, notes: p.notes || 'Technical interview scheduled.' } : p
    ));
    const process = selectionProcesses.find((p) => p.id === processId);
    if (!process) return;
    const updatedProcess: SelectionProcess = { ...process, current_stage: stage, technical_interview_date: date, notes: process.notes || 'Technical interview scheduled.' };
    api.upsertSelectionProcess(updatedProcess).catch(() => {});
    const techInterviewReq: InterviewRequest = {
      id: crypto.randomUUID(), applicant_id: process.applicant_id, employer_id: process.employer_id,
      role_title: `Technical Interview - ${process.role_title}`, requested_date: date,
      status: 'pending', message: `Technical interview scheduled for ${process.role_title} position.`,
      created_at: new Date().toISOString(),
    };
    setInterviewRequests((prev) => [...prev, techInterviewReq]);
    api.upsertInterviewRequest(techInterviewReq).catch(() => {});
    const applicant = findTalentById(process.applicant_id);
    const employer = findEmployer(process.employer_id);
    const applicantUserId2 = applicant?.user_id;
    const empUserId4 = findEmployerUserId(process.employer_id);
    if (applicantUserId2) {
      const n: Notification = {
        id: crypto.randomUUID(), user_id: applicantUserId2,
        title: 'Technical Interview Scheduled',
        message: `A technical interview has been scheduled with ${employer?.company_name || 'the employer'} for ${process.role_title} on ${new Date(date).toLocaleDateString()}.`,
        type: 'process', read: false, created_at: new Date().toISOString(),
      };
      setNotifications((prev) => [...prev, n]);
      api.upsertNotification(n).catch(() => {});
    }
    if (empUserId4) {
      const n: Notification = {
        id: crypto.randomUUID(), user_id: empUserId4,
        title: 'Technical Interview Scheduled',
        message: `Technical interview for ${applicant?.display_name || 'candidate'} has been scheduled for ${new Date(date).toLocaleDateString()}.`,
        type: 'process', read: false, created_at: new Date().toISOString(),
      };
      setNotifications((prev) => [...prev, n]);
      api.upsertNotification(n).catch(() => {});
    }
  }, [selectionProcesses, findTalentById, findEmployer, findEmployerUserId]);

  const updateProcessStatus = useCallback(async (processId: string, status: 'active' | 'on_hold' | 'not_selected') => {
    const prevProcess = selectionProcesses.find((p) => p.id === processId);
    if (!prevProcess) return;
    const updated: SelectionProcess = { ...prevProcess, status };
    setSelectionProcesses((prev) => prev.map((p) => (p.id === processId ? updated : p)));
    try {
      await api.upsertSelectionProcess(updated);
    } catch {
      setSelectionProcesses((prev) => prev.map((p) => (p.id === processId ? prevProcess : p)));
    }
  }, [selectionProcesses]);

  const updateProcessHourlyRate = useCallback(async (processId: string, hourlyRate: number) => {
    const prevProcess = selectionProcesses.find((p) => p.id === processId);
    if (!prevProcess) return;
    const updated: SelectionProcess = { ...prevProcess, hourly_rate: hourlyRate };
    setSelectionProcesses((prev) => prev.map((p) => (p.id === processId ? updated : p)));
    try {
      await api.upsertSelectionProcess(updated);
    } catch {
      setSelectionProcesses((prev) => prev.map((p) => (p.id === processId ? prevProcess : p)));
    }
  }, [selectionProcesses]);

  const submitTimesheet = useCallback(async (processId: string, month: string, days: TimesheetDay[]) => {
    const timesheet = await api.submitTimesheet(processId, month, days);
    setTimesheets((prev) => {
      const exists = prev.some((t) => t.id === timesheet.id);
      return exists ? prev.map((t) => (t.id === timesheet.id ? timesheet : t)) : [...prev, timesheet];
    });

    const process = selectionProcesses.find((p) => p.id === processId);
    const applicant = process ? findTalentById(process.applicant_id) : undefined;
    const empUserId = process ? findEmployerUserId(process.employer_id) : undefined;
    if (empUserId) {
      const n: Notification = {
        id: crypto.randomUUID(), user_id: empUserId,
        title: 'Hours submitted for review',
        message: `${applicant?.display_name || 'Your engineer'} submitted their hours for ${month} — ${timesheet.total_hours}h total.`,
        type: 'process', read: false, created_at: new Date().toISOString(),
      };
      setNotifications((prev) => [...prev, n]);
      api.upsertNotification(n).catch(() => {});
    }
  }, [selectionProcesses, findTalentById, findEmployerUserId]);

  const reviewTimesheet = useCallback(async (timesheetId: string, decision: 'approved' | 'rejected', comment?: string) => {
    const timesheet = await api.reviewTimesheet(timesheetId, decision, comment);
    setTimesheets((prev) => prev.map((t) => (t.id === timesheetId ? timesheet : t)));

    const process = selectionProcesses.find((p) => p.id === timesheet.process_id);
    const applicantUserId = process ? findTalentById(process.applicant_id)?.user_id : undefined;
    if (applicantUserId) {
      const n: Notification = {
        id: crypto.randomUUID(), user_id: applicantUserId,
        title: decision === 'approved' ? 'Hours approved' : 'Hours need corrections',
        message: decision === 'approved'
          ? `Your hours for ${timesheet.month} were approved. A billing statement was generated.`
          : `Your hours for ${timesheet.month} were sent back for corrections: ${comment}`,
        type: 'process', read: false, created_at: new Date().toISOString(),
      };
      setNotifications((prev) => [...prev, n]);
      api.upsertNotification(n).catch(() => {});
    }
  }, [selectionProcesses, findTalentById]);

  /** Find the selection process this interview request belongs to (by stage, matching the role_title convention used for technical interviews). */
  const findProcessForRequest = useCallback((request: InterviewRequest) => {
    const isTechnical = request.role_title.startsWith('Technical Interview - ');
    return selectionProcesses.find((p) =>
      p.applicant_id === request.applicant_id &&
      p.employer_id === request.employer_id &&
      p.current_stage === (isTechnical ? 'technical_interview' : 'intro_interview')
    );
  }, [selectionProcesses]);

  const addMeetingLink = useCallback((requestId: string, url: string) => {
    setInterviewRequests((prev) => prev.map((r) => r.id === requestId ? { ...r, meeting_url: url, status: 'scheduled' } : r));
    const request = interviewRequests.find((r) => r.id === requestId);
    if (!request) return;
    api.upsertInterviewRequest({ ...request, meeting_url: url, status: 'scheduled' }).catch(() => {});

    const process = findProcessForRequest(request);
    if (process) {
      const updatedProcess = { ...process, meeting_url: url };
      setSelectionProcesses((prev) => prev.map((p) => p.id === process.id ? updatedProcess : p));
      api.upsertSelectionProcess(updatedProcess).catch(() => {});
    }

    const applicant = findTalentById(request.applicant_id);
    const applicantUserId = applicant?.user_id;
    if (applicantUserId) {
      const n: Notification = {
        id: crypto.randomUUID(), user_id: applicantUserId,
        title: 'Meeting Link Ready',
        message: `The meeting link for your ${request.role_title} interview is ready.`,
        type: 'interview', read: false, created_at: new Date().toISOString(),
        metadata: { join_url: url },
      };
      setNotifications((prev) => [...prev, n]);
      api.upsertNotification(n).catch(() => {});
    }
  }, [interviewRequests, findProcessForRequest, findTalentById]);

  const reportInterviewOutcome = useCallback((requestId: string, outcome: 'passed' | 'failed', notes: string) => {
    setInterviewRequests((prev) => prev.map((r) => r.id === requestId ? { ...r, outcome, outcome_notes: notes, status: 'completed' } : r));
    const request = interviewRequests.find((r) => r.id === requestId);
    if (!request) return;
    api.upsertInterviewRequest({ ...request, outcome, outcome_notes: notes, status: 'completed' }).catch(() => {});

    if (outcome === 'failed') {
      const process = findProcessForRequest(request);
      if (process) {
        const updatedProcess: SelectionProcess = { ...process, status: 'not_selected' };
        setSelectionProcesses((prev) => prev.map((p) => p.id === process.id ? updatedProcess : p));
        api.upsertSelectionProcess(updatedProcess).catch(() => {});
      }
    }

    const applicant = findTalentById(request.applicant_id);
    const applicantUserId = applicant?.user_id;
    if (applicantUserId) {
      const n: Notification = {
        id: crypto.randomUUID(), user_id: applicantUserId,
        title: 'Interview Result',
        message: outcome === 'passed'
          ? `Good news — you passed the ${request.role_title} interview.`
          : `Your ${request.role_title} interview result: not moving forward this time.`,
        type: 'interview', read: false, created_at: new Date().toISOString(),
      };
      setNotifications((prev) => [...prev, n]);
      api.upsertNotification(n).catch(() => {});
    }
  }, [interviewRequests, findProcessForRequest, findTalentById]);

  const toggleShortlist = useCallback(async (applicantId: string) => {
    const wasShortlisted = shortlistedIds.includes(applicantId);
    setShortlistedIds((prev) => wasShortlisted ? prev.filter((id) => id !== applicantId) : [...prev, applicantId]);
    try {
      await api.toggleShortlist(applicantId);
    } catch {
      setShortlistedIds((prev) => wasShortlisted ? [...prev, applicantId] : prev.filter((id) => id !== applicantId));
    }
  }, [shortlistedIds]);

  const updateAccessRequestStatus = useCallback(async (id: string, status: AccessRequest['status']) => {
    const prevRequest = accessRequests.find((r) => r.id === id);
    if (!prevRequest) return;
    setAccessRequestsState((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      await api.upsertAccessRequest({ ...prevRequest, status });
    } catch {
      setAccessRequestsState((prev) => prev.map((r) => (r.id === id ? prevRequest : r)));
    }
  }, [accessRequests]);

  const isShortlisted = useCallback((applicantId: string) => shortlistedIds.includes(applicantId), [shortlistedIds]);

  const getAvailabilityForApplicant = useCallback((applicantId: string) => {
    return availabilitySlots.filter((s) => s.applicant_id === applicantId);
  }, [availabilitySlots]);

  const updateAvailabilitySlots = useCallback((applicantId: string, slots: AvailabilitySlot[]) => {
    setAvailabilitySlots((prev) => {
      const oldForApplicant = prev.filter((s) => s.applicant_id === applicantId);
      api.deleteAvailabilitySlots(oldForApplicant.map((s) => s.id)).catch(() => {});
      api.upsertAvailabilitySlots(slots).catch(() => {});
      const other = prev.filter((s) => s.applicant_id !== applicantId);
      return [...other, ...slots];
    });
  }, []);

  const requestContractApprovalFn = useCallback(async (processId: string) => {
    const process = selectionProcesses.find((p) => p.id === processId);
    if (!process) return;
    const applicant = findTalentById(process.applicant_id);
    const employer = findEmployer(process.employer_id);
    let newReq: ContractApprovalRequest | undefined;
    try {
      newReq = await api.createContractApprovalRequest(processId, process.employer_id, process.applicant_id);
    } catch {
      return;
    }
    const req = newReq;
    if (req) setContractApprovalRequests((prev) => [...prev, req]);
    const updatedProcess: SelectionProcess = { ...process, current_stage: 'contract_signing' as const };
    setSelectionProcesses((prev) => prev.map((p) => p.id === processId ? updatedProcess : p));
    api.upsertSelectionProcess(updatedProcess).catch(() => {});
    const n: Notification = {
      id: crypto.randomUUID(), user_id: 'p-admin1',
      title: 'Contract Approval Requested',
      message: `${employer?.company_name || 'An employer'} requests to initiate contract for ${applicant?.display_name || 'candidate'} in ${process.role_title}.`,
      type: 'request', read: false, created_at: new Date().toISOString(),
    };
    setNotifications((prev) => [...prev, n]);
    api.upsertNotification(n).catch(() => {});
  }, [selectionProcesses, findTalentById, findEmployer]);

  const initiateContract = requestContractApprovalFn;
  const requestContractApproval = requestContractApprovalFn;

  const approveContractRequest = useCallback(async (requestId: string, processId: string) => {
    try {
      await api.reviewContractApprovalRequest(requestId, 'approved');
    } catch {
      return;
    }
    setContractApprovalRequests((prev) =>
      prev.map((r) => r.id === requestId ? { ...r, status: 'approved', reviewed_at: new Date().toISOString() } : r)
    );
    const pdfResult = await api.generateContractPdf(processId);
    setSelectionProcesses((prev) => prev.map((p) =>
      p.id === processId ? { ...p, current_stage: 'contract_signing', contract_status: 'pending', contract_url: pdfResult.url ?? null } : p
    ));
    const process = selectionProcesses.find((p) => p.id === processId);
    if (!process) return;
    const applicant = findTalentById(process.applicant_id);
    const employer = findEmployer(process.employer_id);
    const empUserId = findEmployerUserId(process.employer_id);
    if (empUserId) {
      const n: Notification = {
        id: crypto.randomUUID(), user_id: empUserId,
        title: 'Contract Approved',
        message: `The admin approved the contract initiation for ${applicant?.display_name || 'candidate'}.`,
        type: 'contract', read: false, created_at: new Date().toISOString(),
      };
      setNotifications((prev) => [...prev, n]);
      api.upsertNotification(n).catch(() => {});
    }
    const appUserId = applicant?.user_id;
    if (appUserId) {
      const n: Notification = {
        id: crypto.randomUUID(), user_id: appUserId,
        title: 'Contract Stage Started',
        message: `${employer?.company_name || 'The company'} has initiated contract signing for ${process.role_title}.`,
        type: 'contract', read: false, created_at: new Date().toISOString(),
      };
      setNotifications((prev) => [...prev, n]);
      api.upsertNotification(n).catch(() => {});
    }
  }, [selectionProcesses, findTalentById, findEmployer, findEmployerUserId]);

  const rejectContractRequest = useCallback(async (requestId: string, processId: string) => {
    try {
      await api.reviewContractApprovalRequest(requestId, 'rejected');
    } catch {
      return;
    }
    setContractApprovalRequests((prev) =>
      prev.map((r) => r.id === requestId ? { ...r, status: 'rejected', reviewed_at: new Date().toISOString() } : r)
    );
    const process = selectionProcesses.find((p) => p.id === processId);
    if (!process) return;
    const applicant = findTalentById(process.applicant_id);
    const employer = findEmployer(process.employer_id);
    const empUserId = findEmployerUserId(process.employer_id);
    if (empUserId) {
      const n: Notification = {
        id: crypto.randomUUID(), user_id: empUserId,
        title: 'Contract Request Rejected',
        message: `The admin rejected the contract request for ${applicant?.display_name || 'candidate'}.`,
        type: 'request', read: false, created_at: new Date().toISOString(),
      };
      setNotifications((prev) => [...prev, n]);
      api.upsertNotification(n).catch(() => {});
    }
  }, [selectionProcesses, findTalentById, findEmployer, findEmployerUserId]);

  const signContract = useCallback(async (processId: string, signatureBlob: Blob) => {
    const result = await api.signContract(processId, signatureBlob);
    if (result.error) throw new Error(result.error);
    if (result.signature_url) {
      setSelectionProcesses((prev) => prev.map((p) =>
        p.id === processId ? {
          ...p,
          signature_url: result.signature_url!,
          contract_url: result.contract_url ?? p.contract_url,
          contract_status: 'under_review',
        } : p
      ));
      const process = selectionProcesses.find((p) => p.id === processId);
      if (process) {
        const applicant = findTalentById(process.applicant_id);
        const employer = findEmployer(process.employer_id);
        const adminNotif: Notification = {
          id: crypto.randomUUID(), user_id: 'p-admin1',
          title: 'Contract Signed by Applicant',
          message: `${applicant?.display_name || 'Applicant'} has signed the contract for ${process.role_title}. Please review and verify.`,
          type: 'contract', read: false, created_at: new Date().toISOString(),
        };
        setNotifications((prev) => [...prev, adminNotif]);
        api.upsertNotification(adminNotif).catch(() => {});
      }
    }
  }, [selectionProcesses, findTalentById, findEmployer]);

  const verifyContract = useCallback(async (processId: string) => {
    await api.verifyContract(processId);
    setSelectionProcesses((prev) => prev.map((p) =>
      p.id === processId ? { ...p, contract_status: 'signed', status: 'hired' } : p
    ));
    const process = selectionProcesses.find((p) => p.id === processId);
    if (process) {
      const applicant = findTalentById(process.applicant_id);
      const employer = findEmployer(process.employer_id);
      const empUserId = findEmployerUserId(process.employer_id);
      if (empUserId) {
        const n: Notification = {
          id: crypto.randomUUID(), user_id: empUserId,
          title: 'Contract Finalized',
          message: `The contract for ${applicant?.display_name || 'candidate'} has been finalized and signed.`,
          type: 'contract', read: false, created_at: new Date().toISOString(),
        };
        setNotifications((prev) => [...prev, n]);
        api.upsertNotification(n).catch(() => {});
      }
      const appUserId = applicant?.user_id;
      if (appUserId) {
        const n: Notification = {
          id: crypto.randomUUID(), user_id: appUserId,
          title: 'Contract Finalized',
          message: `Your contract with ${employer?.company_name || 'the company'} has been finalized.`,
          type: 'contract', read: false, created_at: new Date().toISOString(),
        };
        setNotifications((prev) => [...prev, n]);
        api.upsertNotification(n).catch(() => {});
      }
    }
  }, [selectionProcesses, findTalentById, findEmployer, findEmployerUserId]);

  const uploadContract = verifyContract;

  const getProcessById = useCallback((processId: string) => {
    return selectionProcesses.find((p) => p.id === processId);
  }, [selectionProcesses]);

  const getNotifsForUser = useCallback((userId: string) =>
    notifications.filter((n) => n.user_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
  [notifications]);

  const setProfiles = useCallback((list: Profile[]) => setProfilesState(list), []);

  const createVacancy = useCallback(async (v: Vacancy): Promise<void> => {
    setVacancies((prev) => [v, ...prev]);
    try {
      await api.upsertVacancy(v);
    } catch (err) {
      setVacancies((prev) => prev.filter((x) => x.id !== v.id));
      throw err;
    }
  }, []);

  const updateCandidateStatusFn = useCallback(async (candidateId: string, status: Candidate['manual_status']): Promise<void> => {
    const prevStatus = candidates.find((c) => c.id === candidateId)?.manual_status;
    setCandidates((prev) => prev.map((c) => c.id === candidateId ? { ...c, manual_status: status } : c));
    try {
      await api.updateCandidateStatus(candidateId, status);
    } catch (err) {
      if (prevStatus) setCandidates((prev) => prev.map((c) => c.id === candidateId ? { ...c, manual_status: prevStatus } : c));
      throw err;
    }
  }, [candidates]);

  const updateTalentProfileFn = useCallback(async (profile: TalentProfile & { skills: TalentSkill[] }): Promise<void> => {
    await api.upsertTalentProfile(profile as TalentProfile & { skills: TalentSkill[] });
    setTalentProfiles((prev) => prev.map((t) => t.id === profile.id ? profile : t));
  }, []);

  const createResource = useCallback(async (formData: FormData): Promise<void> => {
    const created = await api.createResource(formData);
    setResources((prev) => [created, ...prev]);
  }, []);

  const updateResourceVisibility = useCallback(async (id: string, visibility: Resource['visibility']): Promise<void> => {
    const prevResource = resources.find((r) => r.id === id);
    if (!prevResource) return;
    setResources((prev) => prev.map((r) => (r.id === id ? { ...r, visibility } : r)));
    try {
      await api.upsertResource({ id, visibility });
    } catch (err) {
      setResources((prev) => prev.map((r) => (r.id === id ? prevResource : r)));
      throw err;
    }
  }, [resources]);

  const value = useMemo<DataContextType>(() => ({
    isHydrated, talentProfiles, profiles, employerProfiles, accessRequests,
    interviewRequests, selectionProcesses, notifications, shortlistedIds,
    availabilitySlots, bootcamps, enrollments, resources,
    createResource, updateResourceVisibility,
    contractApprovalRequests,
    vacancies, candidates, createVacancy,
    updateCandidateStatus: updateCandidateStatusFn,
    createInterviewRequest, respondToInterview, setProcessStage, updateProcessStatus, updateProcessHourlyRate, addMeetingLink, reportInterviewOutcome,
    timesheets, timesheetEvents, submitTimesheet, reviewTimesheet,
    toggleShortlist, updateAccessRequestStatus, isShortlisted, getAvailabilityForApplicant,
    getNotificationsForUser: getNotifsForUser,
    getApplicantById: findTalentById,
    getEmployerById: findEmployer,
    updateAvailabilitySlots, initiateContract, requestContractApproval,
    approveContractRequest, rejectContractRequest,
    uploadContract, signContract, verifyContract, getProcessById,
    setAccessRequests: setAccessRequestsState,
    setProfiles,
    refreshAll: hydrateFromSupabase,
    updateTalentProfile: updateTalentProfileFn,
  }), [
    isHydrated, talentProfiles, profiles, employerProfiles, accessRequests,
    interviewRequests, selectionProcesses, notifications, shortlistedIds,
    availabilitySlots, bootcamps, enrollments, resources, timesheets, timesheetEvents,
    createResource, updateResourceVisibility,
    contractApprovalRequests,
    vacancies, candidates, createVacancy, updateCandidateStatusFn,
    createInterviewRequest, respondToInterview, setProcessStage, updateProcessStatus, updateProcessHourlyRate, addMeetingLink, reportInterviewOutcome,
    submitTimesheet, reviewTimesheet,
    toggleShortlist, updateAccessRequestStatus, isShortlisted, getAvailabilityForApplicant,
    getNotifsForUser, findTalentById, findEmployer,
    updateAvailabilitySlots, initiateContract, requestContractApproval,
    approveContractRequest, rejectContractRequest,
    uploadContract, signContract, verifyContract, getProcessById,
    updateTalentProfileFn,
    hydrateFromSupabase,
  ]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
