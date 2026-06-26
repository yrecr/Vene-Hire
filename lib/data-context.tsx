'use client';

import { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import type {
  TalentProfile, InterviewRequest, SelectionProcess, Notification, AvailabilitySlot,
  EmployerProfile, Profile, AccessRequest, TalentSkill, Bootcamp, Enrollment, Resource,
  ContractApprovalRequest,
} from '@/types';
import { createZoomMeeting } from '@/lib/zoom';
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
  createInterviewRequest: (data: NewInterviewData) => void;
  respondToInterview: (requestId: string, status: 'accepted' | 'declined') => void;
  setProcessStage: (processId: string, stage: 'technical_interview', date: string) => void;
  createIntroMeeting: (processId: string) => Promise<void>;
  toggleShortlist: (applicantId: string) => void;
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
  getProcessById: (processId: string) => SelectionProcess | undefined;
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
  const [isHydrated, setIsHydrated] = useState(false);
  const hydrateFromSupabase = useCallback(async () => {
    try {
      const [tp, p, ep, ar, ir, sp, n, av, bc, en, re, car] = await Promise.allSettled([
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
      ]);

      // Replace seed data with real Supabase data to avoid duplicates
      if (tp.status === 'fulfilled' && tp.value.length) setTalentProfiles(tp.value);
      if (av.status === 'fulfilled' && av.value.length) setAvailabilitySlots(av.value);
      if (p.status === 'fulfilled' && p.value.length) setProfilesState(p.value);
      if (ep.status === 'fulfilled') setEmployerProfiles(ep.value);
      if (ar.status === 'fulfilled' && ar.value.length) setAccessRequestsState(ar.value);
      if (ir.status === 'fulfilled' && ir.value.length) setInterviewRequests(ir.value);
      if (sp.status === 'fulfilled' && sp.value.length) setSelectionProcesses(sp.value);
      if (n.status === 'fulfilled' && n.value.length) setNotifications(n.value);
      if (bc.status === 'fulfilled' && bc.value.length) setBootcamps(bc.value);
      if (en.status === 'fulfilled' && en.value.length) setEnrollments(en.value);
      if (re.status === 'fulfilled' && re.value.length) setResources(re.value);
      if (car.status === 'fulfilled' && car.value.length) setContractApprovalRequests(car.value);
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
          meeting_url: null, contract_status: null,
          notes: 'Process started from interview request acceptance.',
          created_at: new Date().toISOString(),
        };
        setSelectionProcesses((prev) => [...prev, newProcess]);
        api.upsertSelectionProcess(newProcess).catch(() => {});

        // Create Zoom meeting via n8n NOW (when applicant accepts the intro interview)
        const applicantForZoom = findTalentById(request.applicant_id);
        const employerForZoom = findEmployer(request.employer_id);
        createZoomMeeting({
          topic: request.role_title,
          start_time: request.requested_date,
          interview_id: request.id,
          applicant_name: applicantForZoom?.display_name,
          employer_name: employerForZoom?.company_name,
          employer_id: request.employer_id,
          applicant_id: request.applicant_id,
        }).then((meeting) => {
          // Update the interview request with the real join_url
          setInterviewRequests((prev) =>
            prev.map((r) => r.id === request.id ? { ...r, meeting_url: meeting.join_url } : r)
          );
          api.upsertInterviewRequest({ ...request, status, meeting_url: meeting.join_url }).catch(() => {});
          // Update the selection process with the real join_url
          setSelectionProcesses((prev) =>
            prev.map((p) => p.id === processId ? { ...p, meeting_url: meeting.join_url } : p)
          );
          api.upsertSelectionProcess({ ...newProcess, meeting_url: meeting.join_url }).catch(() => {});
        }).catch(() => {
          // n8n/Zoom failed — process already saved without meeting_url, user can retry via CreateIntroMeet button
        });
      }
      const applicant = findTalentById(request.applicant_id);
      const employer = findEmployer(request.employer_id);
      const uid_app = applicant?.user_id;
      if (uid_app) {
        const n: Notification = {
          id: crypto.randomUUID(), user_id: uid_app,
          title: existingProcess ? 'Technical Interview Accepted' : 'Interview Accepted',
          message: existingProcess ? `You accepted the technical interview with ${employer?.company_name || 'employer'} for ${request.role_title}.` : `You accepted the interview with ${employer?.company_name || 'employer'}. A Zoom meeting will be ready shortly.`,
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
          message: existingProcess ? `${applicant?.display_name || 'Applicant'} accepted the technical interview.` : `${applicant?.display_name || 'Applicant'} accepted your interview request. A Zoom meeting is being created.`,
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
    createZoomMeeting({
      topic: techInterviewReq.role_title, start_time: date, interview_id: techInterviewReq.id,
      applicant_name: applicant?.display_name, employer_name: employer?.company_name,
      employer_id: process.employer_id, applicant_id: process.applicant_id,
    }).then((meeting) => {
      setInterviewRequests((prev) => prev.map((r) => r.id === techInterviewReq.id ? { ...r, meeting_url: meeting.join_url } : r));
      api.upsertInterviewRequest({ ...techInterviewReq, meeting_url: meeting.join_url }).catch(() => {});
      // Also store join_url in SelectionProcess so the timeline video icon works
      setSelectionProcesses((prev) => prev.map((p) =>
        p.id === processId ? { ...p, meeting_url: meeting.join_url } : p
      ));
      api.upsertSelectionProcess({ ...updatedProcess, meeting_url: meeting.join_url }).catch(() => {});
      // Notify applicant with join_url in metadata
      if (applicantUserId2) {
        const n: Notification = {
          id: crypto.randomUUID(), user_id: applicantUserId2,
          title: 'Technical Interview Scheduled',
          message: `A technical interview has been scheduled with ${employer?.company_name || 'the employer'} for ${process.role_title} on ${new Date(date).toLocaleDateString()}.`,
          type: 'process', read: false, created_at: new Date().toISOString(),
          metadata: { join_url: meeting.join_url },
        };
        setNotifications((prev) => [...prev, n]);
        api.upsertNotification(n).catch(() => {});
      }
      // Notify employer with join_url in metadata
      if (empUserId4) {
        const n: Notification = {
          id: crypto.randomUUID(), user_id: empUserId4,
          title: 'Technical Interview Scheduled',
          message: `Technical interview for ${applicant?.display_name || 'candidate'} has been scheduled for ${new Date(date).toLocaleDateString()}.`,
          type: 'process', read: false, created_at: new Date().toISOString(),
          metadata: { join_url: meeting.join_url },
        };
        setNotifications((prev) => [...prev, n]);
        api.upsertNotification(n).catch(() => {});
      }
    }).catch(() => {
      // Zoom failed – still notify without link
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
    });
  }, [selectionProcesses, findTalentById, findEmployer, findEmployerUserId]);

  const createIntroMeeting = useCallback(async (processId: string): Promise<void> => {
    const process = selectionProcesses.find((p) => p.id === processId);
    if (!process) return;
    const applicant = findTalentById(process.applicant_id);
    const employer = findEmployer(process.employer_id);
    const interviewId = crypto.randomUUID();
    let meeting;
    try {
      meeting = await createZoomMeeting({
        topic: `Intro Interview - ${process.role_title}`,
        start_time: process.intro_interview_date || new Date().toISOString(),
        interview_id: interviewId,
        applicant_name: applicant?.display_name,
        employer_name: employer?.company_name,
        employer_id: process.employer_id,
        applicant_id: process.applicant_id,
      });
    } catch {
      return;
    }
    const updatedProcess: SelectionProcess = { ...process, meeting_url: meeting.join_url };
    setSelectionProcesses((prev) => prev.map((p) => p.id === processId ? updatedProcess : p));
    api.upsertSelectionProcess(updatedProcess).catch(() => {});
    // Notify applicant
    const applicantUserId = applicant?.user_id;
    if (applicantUserId) {
      const n: Notification = {
        id: crypto.randomUUID(), user_id: applicantUserId,
        title: 'Intro Interview Meeting Ready',
        message: `${employer?.company_name || 'The employer'} has created a meeting for your intro interview for ${process.role_title}.`,
        type: 'interview', read: false, created_at: new Date().toISOString(),
        metadata: { join_url: meeting.join_url },
      };
      setNotifications((prev) => [...prev, n]);
      api.upsertNotification(n).catch(() => {});
    }
    // Notify employer
    const empUserId = findEmployerUserId(process.employer_id);
    if (empUserId) {
      const n: Notification = {
        id: crypto.randomUUID(), user_id: empUserId,
        title: 'Intro Interview Meeting Created',
        message: `Intro interview meeting created for ${applicant?.display_name || 'candidate'} – ${process.role_title}.`,
        type: 'interview', read: false, created_at: new Date().toISOString(),
        metadata: { join_url: meeting.join_url },
      };
      setNotifications((prev) => [...prev, n]);
      api.upsertNotification(n).catch(() => {});
    }
  }, [selectionProcesses, findTalentById, findEmployer, findEmployerUserId]);

  const toggleShortlist = useCallback((applicantId: string) => {
    setShortlistedIds((prev) => prev.includes(applicantId) ? prev.filter((id) => id !== applicantId) : [...prev, applicantId]);
  }, []);

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
    setSelectionProcesses((prev) => prev.map((p) =>
      p.id === processId ? { ...p, current_stage: 'contract_signing', contract_status: 'pending' } : p
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

  const uploadContract = useCallback((processId: string) => {
    setSelectionProcesses((prev) => prev.map((p) =>
      p.id === processId ? { ...p, contract_status: 'signed', status: 'hired' } : p
    ));
    const process = selectionProcesses.find((p) => p.id === processId);
    if (process) {
      const updated: SelectionProcess = { ...process, contract_status: 'signed', status: 'hired' as const };
      api.upsertSelectionProcess(updated).catch(() => {});
    }
  }, [selectionProcesses]);

  const getProcessById = useCallback((processId: string) => {
    return selectionProcesses.find((p) => p.id === processId);
  }, [selectionProcesses]);

  const getNotifsForUser = useCallback((userId: string) => notifications.filter((n) => n.user_id === userId), [notifications]);

  const setProfiles = useCallback((list: Profile[]) => setProfilesState(list), []);

  const updateTalentProfileFn = useCallback(async (profile: TalentProfile & { skills: TalentSkill[] }): Promise<void> => {
    await api.upsertTalentProfile(profile as TalentProfile & { skills: TalentSkill[] });
    setTalentProfiles((prev) => prev.map((t) => t.id === profile.id ? profile : t));
  }, []);

  const value = useMemo<DataContextType>(() => ({
    isHydrated, talentProfiles, profiles, employerProfiles, accessRequests,
    interviewRequests, selectionProcesses, notifications, shortlistedIds,
    availabilitySlots, bootcamps, enrollments, resources,
    contractApprovalRequests,
    createInterviewRequest, respondToInterview, setProcessStage, createIntroMeeting,
    toggleShortlist, isShortlisted, getAvailabilityForApplicant,
    getNotificationsForUser: getNotifsForUser,
    getApplicantById: findTalentById,
    getEmployerById: findEmployer,
    updateAvailabilitySlots, initiateContract, requestContractApproval,
    approveContractRequest, rejectContractRequest,
    uploadContract, getProcessById,
    setAccessRequests: setAccessRequestsState,
    setProfiles,
    updateTalentProfile: updateTalentProfileFn,
  }), [
    isHydrated, talentProfiles, profiles, employerProfiles, accessRequests,
    interviewRequests, selectionProcesses, notifications, shortlistedIds,
    availabilitySlots, bootcamps, enrollments, resources,
    contractApprovalRequests,
    createInterviewRequest, respondToInterview, setProcessStage, createIntroMeeting,
    toggleShortlist, isShortlisted, getAvailabilityForApplicant,
    getNotifsForUser, findTalentById, findEmployer,
    updateAvailabilitySlots, initiateContract, requestContractApproval,
    approveContractRequest, rejectContractRequest,
    uploadContract, getProcessById,
    updateTalentProfileFn,
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
