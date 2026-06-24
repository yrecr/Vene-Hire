'use client';

import { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import type {
  TalentProfile, InterviewRequest, SelectionProcess, Notification, AvailabilitySlot,
  EmployerProfile, Profile, AccessRequest, TalentSkill, Bootcamp, Enrollment, Resource,
} from '@/types';
import { createZoomMeeting } from '@/lib/zoom';
import {
  mockTalentProfiles as seedTalentProfiles,
  mockAvailabilitySlots as seedAvailabilitySlots,
  mockInterviewRequests as seedInterviewRequests,
  mockSelectionProcesses as seedProcesses,
  mockNotifications as seedNotifications,
  mockProfiles as seedProfiles,
  mockEmployerProfiles as seedEmployerProfiles,
  mockAccessRequests as seedAccessRequests,
  mockBootcamps as seedBootcamps,
  mockEnrollments as seedEnrollments,
  mockResources as seedResources,
} from '@/data/mock';
import * as api from './supabase-service';

function loadPersisted<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function persist(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

let autoId = 1000;
function genId(prefix: string) { return `${prefix}${autoId++}`; }

function loadProfiles(): Profile[] {
  return loadPersisted('vh-profiles', seedProfiles);
}
function loadTalentProfiles(): (TalentProfile & { skills: TalentSkill[] })[] {
  const persisted = loadPersisted<(TalentProfile & { skills: TalentSkill[] })[]>('vh-talent-profiles', []);
  return persisted.length ? persisted : seedTalentProfiles;
}
function loadEmployerProfiles(): EmployerProfile[] {
  return loadPersisted('vh-employers', seedEmployerProfiles);
}
function loadAccessRequests(): AccessRequest[] {
  return loadPersisted('vh-access-requests', seedAccessRequests);
}

interface NewInterviewData {
  applicant_id: string;
  employer_id: string;
  role_title: string;
  requested_date: string;
  message: string;
}

interface DataContextType {
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
  toggleShortlist: (applicantId: string) => void;
  isShortlisted: (applicantId: string) => boolean;
  getAvailabilityForApplicant: (applicantId: string) => AvailabilitySlot[];
  getNotificationsForUser: (userId: string) => Notification[];
  getApplicantById: (id: string) => (TalentProfile & { skills: TalentSkill[] }) | undefined;
  getEmployerById: (id: string) => EmployerProfile | undefined;
  updateAvailabilitySlots: (applicantId: string, slots: AvailabilitySlot[]) => void;
  initiateContract: (processId: string) => void;
  uploadContract: (processId: string) => void;
  getProcessById: (processId: string) => SelectionProcess | undefined;
  setAccessRequests: (updater: AccessRequest[] | ((prev: AccessRequest[]) => AccessRequest[])) => void;
  setProfiles: (list: Profile[]) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function MockDataProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [interviewRequests, setInterviewRequests] = useState<InterviewRequest[]>([]);
  const [selectionProcesses, setSelectionProcesses] = useState<SelectionProcess[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [talentProfiles, setTalentProfiles] = useState<(TalentProfile & { skills: TalentSkill[] })[]>([]);
  const [profiles, setProfilesState] = useState<Profile[]>([]);
  const [employerProfiles, setEmployerProfiles] = useState<EmployerProfile[]>([]);
  const [accessRequests, setAccessRequestsState] = useState<AccessRequest[]>([]);
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const hydrateFromSupabase = useCallback(async () => {
    try {
      const [tp, p, ep, ar, ir, sp, n, av, bc, en, re] = await Promise.allSettled([
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
      ]);

      if (tp.status === 'fulfilled' && tp.value.length) setTalentProfiles(tp.value);
      if (p.status === 'fulfilled' && p.value.length) setProfilesState(p.value);
      if (ep.status === 'fulfilled' && ep.value.length) setEmployerProfiles(ep.value);
      if (ar.status === 'fulfilled' && ar.value.length) setAccessRequestsState(ar.value);
      if (ir.status === 'fulfilled' && ir.value.length) setInterviewRequests(ir.value);
      if (sp.status === 'fulfilled' && sp.value.length) setSelectionProcesses(sp.value);
      if (n.status === 'fulfilled' && n.value.length) setNotifications(n.value);
      if (av.status === 'fulfilled' && av.value.length) setAvailabilitySlots(av.value);
      if (bc.status === 'fulfilled' && bc.value.length) setBootcamps(bc.value);
      if (en.status === 'fulfilled' && en.value.length) setEnrollments(en.value);
      if (re.status === 'fulfilled' && re.value.length) setResources(re.value);
    } catch {
      // Supabase unavailable — use localStorage fallback
    }
  }, []);

  useEffect(() => {
    setInterviewRequests(loadPersisted('vh-interview-requests', seedInterviewRequests));
    setSelectionProcesses(loadPersisted('vh-selection-processes', seedProcesses));
    setNotifications(loadPersisted('vh-notifications', seedNotifications));
    setShortlistedIds(loadPersisted('vh-shortlisted-ids', []));
    setAvailabilitySlots(loadPersisted('vh-availability-slots', seedAvailabilitySlots));
    setTalentProfiles(loadTalentProfiles());
    setProfilesState(loadProfiles());
    setEmployerProfiles(loadEmployerProfiles());
    setAccessRequestsState(loadAccessRequests());
    setBootcamps(loadPersisted('vh-bootcamps', seedBootcamps));
    setEnrollments(loadPersisted('vh-enrollments', seedEnrollments));
    setResources(loadPersisted('vh-resources', seedResources));
    setHydrated(true);
    hydrateFromSupabase();
  }, [hydrateFromSupabase]);

  useEffect(() => { if (hydrated) persist('vh-interview-requests', interviewRequests); }, [interviewRequests, hydrated]);
  useEffect(() => { if (hydrated) persist('vh-selection-processes', selectionProcesses); }, [selectionProcesses, hydrated]);
  useEffect(() => { if (hydrated) persist('vh-notifications', notifications); }, [notifications, hydrated]);
  useEffect(() => { if (hydrated) persist('vh-shortlisted-ids', shortlistedIds); }, [shortlistedIds, hydrated]);
  useEffect(() => { if (hydrated) persist('vh-availability-slots', availabilitySlots); }, [availabilitySlots, hydrated]);
  useEffect(() => { if (hydrated) persist('vh-talent-profiles', talentProfiles); }, [talentProfiles, hydrated]);
  useEffect(() => { if (hydrated) persist('vh-profiles', profiles); }, [profiles, hydrated]);
  useEffect(() => { if (hydrated) persist('vh-employers', employerProfiles); }, [employerProfiles, hydrated]);
  useEffect(() => { if (hydrated) persist('vh-access-requests', accessRequests); }, [accessRequests, hydrated]);
  useEffect(() => { if (hydrated) persist('vh-bootcamps', bootcamps); }, [bootcamps, hydrated]);
  useEffect(() => { if (hydrated) persist('vh-enrollments', enrollments); }, [enrollments, hydrated]);
  useEffect(() => { if (hydrated) persist('vh-resources', resources); }, [resources, hydrated]);

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

  const createInterviewRequest = useCallback((data: NewInterviewData) => {
    const newRequest: InterviewRequest = {
      id: genId('ir-'),
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

    const applicant = findTalentById(data.applicant_id);
    const employer = findEmployer(data.employer_id);

    createZoomMeeting({
      topic: data.role_title, start_time: data.requested_date, interview_id: newRequest.id,
      applicant_name: applicant?.display_name, employer_name: employer?.company_name,
    }).then((meeting) => {
      setInterviewRequests((prev) =>
        prev.map((r) => r.id === newRequest.id ? { ...r, meeting_url: meeting.join_url } : r)
      );
    }).catch(() => {});

    const applicantUserId = applicant?.user_id;
    if (applicantUserId) {
      setNotifications((prev) => [...prev, {
        id: genId('n-'), user_id: applicantUserId,
        title: 'New Interview Request',
        message: `${employer?.company_name || 'An employer'} wants to schedule an interview for ${data.role_title}.`,
        type: 'interview' as const, read: false, created_at: new Date().toISOString(),
      }]);
    }
    const empUserId = findEmployerUserId(data.employer_id);
    if (empUserId) {
      setNotifications((prev) => [...prev, {
        id: genId('n-'), user_id: empUserId,
        title: 'Interview Request Sent',
        message: `Your interview request to ${applicant?.display_name || 'candidate'} for ${data.role_title} has been sent.`,
        type: 'interview' as const, read: false, created_at: new Date().toISOString(),
      }]);
    }
  }, [findTalentById, findEmployer, findEmployerUserId]);

  const respondToInterview = useCallback((requestId: string, status: 'accepted' | 'declined') => {
    setInterviewRequests((prev) => prev.map((req) => req.id === requestId ? { ...req, status } : req));
    const request = interviewRequests.find((r) => r.id === requestId);
    if (status === 'accepted' && request) {
      const isTechnical = request.role_title.startsWith('Technical Interview - ');
      const existingProcess = !isTechnical ? null : selectionProcesses.find(
        (p) => p.applicant_id === request.applicant_id && p.employer_id === request.employer_id
      );
      if (!existingProcess) {
        setSelectionProcesses((prev) => [...prev, {
          id: genId('sp-'),
          applicant_id: request.applicant_id, employer_id: request.employer_id,
          role_title: request.role_title, current_stage: 'intro_interview', status: 'active',
          intro_interview_date: request.requested_date, technical_interview_date: null,
          meeting_url: request.meeting_url, contract_status: null,
          notes: 'Process started from interview request acceptance.',
          created_at: new Date().toISOString(),
        }]);
      }
      const applicant = findTalentById(request.applicant_id);
      const employer = findEmployer(request.employer_id);
      const uid_app = applicant?.user_id;
      if (uid_app) setNotifications((prev) => [...prev, {
        id: genId('n-'), user_id: uid_app,
        title: existingProcess ? 'Technical Interview Accepted' : 'Interview Accepted',
        message: existingProcess ? `You accepted the technical interview with ${employer?.company_name || 'employer'} for ${request.role_title}.` : `You accepted the interview with ${employer?.company_name || 'employer'}. A selection process has been created.`,
        type: 'interview' as const, read: false, created_at: new Date().toISOString(),
      }]);
      const empUserId = findEmployerUserId(request.employer_id);
      if (empUserId) setNotifications((prev) => [...prev, {
        id: genId('n-'), user_id: empUserId,
        title: existingProcess ? 'Technical Interview Accepted' : 'Interview Accepted',
        message: existingProcess ? `${applicant?.display_name || 'Applicant'} accepted the technical interview.` : `${applicant?.display_name || 'Applicant'} accepted your interview request.`,
        type: 'process' as const, read: false, created_at: new Date().toISOString(),
      }]);
    } else if (status === 'declined' && request) {
      const applicant = findTalentById(request.applicant_id);
      const empUserId = findEmployerUserId(request.employer_id);
      if (empUserId) setNotifications((prev) => [...prev, {
        id: genId('n-'), user_id: empUserId,
        title: 'Interview Declined',
        message: `${applicant?.display_name || 'Applicant'} declined your interview request.`,
        type: 'interview' as const, read: false, created_at: new Date().toISOString(),
      }]);
    }
  }, [interviewRequests, selectionProcesses, findTalentById, findEmployer, findEmployerUserId]);

  const setProcessStage = useCallback((processId: string, stage: 'technical_interview', date: string) => {
    setSelectionProcesses((prev) => prev.map((p) =>
      p.id === processId ? { ...p, current_stage: stage, technical_interview_date: date, notes: p.notes || 'Technical interview scheduled.' } : p
    ));
    const process = selectionProcesses.find((p) => p.id === processId);
    if (!process) return;
    const techInterviewReq: InterviewRequest = {
      id: genId('ir-tech-'), applicant_id: process.applicant_id, employer_id: process.employer_id,
      role_title: `Technical Interview - ${process.role_title}`, requested_date: date,
      status: 'pending', message: `Technical interview scheduled for ${process.role_title} position.`,
      created_at: new Date().toISOString(),
    };
    setInterviewRequests((prev) => [...prev, techInterviewReq]);
    const applicant = findTalentById(process.applicant_id);
    const employer = findEmployer(process.employer_id);
    const applicantUserId2 = applicant?.user_id;
    if (applicantUserId2) setNotifications((prev) => [...prev, {
      id: genId('n-'), user_id: applicantUserId2,
      title: 'Technical Interview Scheduled',
      message: `A technical interview has been scheduled with ${employer?.company_name || 'the employer'} for ${process.role_title} on ${new Date(date).toLocaleDateString()}.`,
      type: 'process' as const, read: false, created_at: new Date().toISOString(),
    }]);
    const empUserId4 = findEmployerUserId(process.employer_id);
    if (empUserId4) setNotifications((prev) => [...prev, {
      id: genId('n-'), user_id: empUserId4,
      title: 'Technical Interview Scheduled',
      message: `Technical interview for ${applicant?.display_name || 'candidate'} has been scheduled for ${new Date(date).toLocaleDateString()}.`,
      type: 'process' as const, read: false, created_at: new Date().toISOString(),
    }]);
    createZoomMeeting({
      topic: techInterviewReq.role_title, start_time: date, interview_id: techInterviewReq.id,
      applicant_name: applicant?.display_name, employer_name: employer?.company_name,
    }).then((meeting) => {
      setInterviewRequests((prev) => prev.map((r) => r.id === techInterviewReq.id ? { ...r, meeting_url: meeting.join_url } : r));
    }).catch(() => {});
  }, [selectionProcesses, findTalentById, findEmployer, findEmployerUserId]);

  const toggleShortlist = useCallback((applicantId: string) => {
    setShortlistedIds((prev) => prev.includes(applicantId) ? prev.filter((id) => id !== applicantId) : [...prev, applicantId]);
  }, []);

  const isShortlisted = useCallback((applicantId: string) => shortlistedIds.includes(applicantId), [shortlistedIds]);

  const getAvailabilityForApplicant = useCallback((applicantId: string) => {
    return availabilitySlots.filter((s) => s.applicant_id === applicantId);
  }, [availabilitySlots]);

  const updateAvailabilitySlots = useCallback((applicantId: string, slots: AvailabilitySlot[]) => {
    setAvailabilitySlots((prev) => [...prev.filter((s) => s.applicant_id !== applicantId), ...slots]);
  }, []);

  const initiateContract = useCallback((processId: string) => {
    setSelectionProcesses((prev) => prev.map((p) =>
      p.id === processId ? { ...p, current_stage: 'contract_signing', contract_status: 'pending', notes: p.notes || 'Contract initiated by employer.' } : p
    ));
    const process = selectionProcesses.find((p) => p.id === processId);
    if (!process) return;
    const applicant = findTalentById(process.applicant_id);
    const employer = findEmployer(process.employer_id);
    const applicantUserId3 = applicant?.user_id;
    if (applicantUserId3) setNotifications((prev) => [...prev, {
      id: genId('n-'), user_id: applicantUserId3,
      title: 'Contract Ready for Review',
      message: `${employer?.company_name || 'The employer'} has initiated contract signing for ${process.role_title}.`,
      type: 'contract' as const, read: false, created_at: new Date().toISOString(),
    }]);
    const empUserId = findEmployerUserId(process.employer_id);
    if (empUserId) setNotifications((prev) => [...prev, {
      id: genId('n-'), user_id: empUserId,
      title: 'Contract Stage Started',
      message: `Contract signing has been initiated for ${applicant?.display_name || 'candidate'} for ${process.role_title}.`,
      type: 'contract' as const, read: false, created_at: new Date().toISOString(),
    }]);
    setNotifications((prev) => [...prev, {
      id: genId('n-'), user_id: 'p-admin1',
      title: 'Contract Upload Required',
      message: `Contract for ${applicant?.display_name || 'candidate'} at ${employer?.company_name || 'company'} needs to be uploaded.`,
      type: 'contract' as const, read: false, created_at: new Date().toISOString(),
    }]);
  }, [selectionProcesses, findTalentById, findEmployer, findEmployerUserId]);

  const uploadContract = useCallback((processId: string) => {
    setSelectionProcesses((prev) => prev.map((p) =>
      p.id === processId ? { ...p, contract_status: 'signed', status: 'hired' } : p
    ));
  }, []);

  const getProcessById = useCallback((processId: string) => {
    return selectionProcesses.find((p) => p.id === processId);
  }, [selectionProcesses]);

  const getNotifsForUser = useCallback((userId: string) => notifications.filter((n) => n.user_id === userId), [notifications]);

  const setProfiles = useCallback((list: Profile[]) => setProfilesState(list), []);

  const value = useMemo<DataContextType>(() => ({
    talentProfiles, profiles, employerProfiles, accessRequests,
    interviewRequests, selectionProcesses, notifications, shortlistedIds,
    availabilitySlots, bootcamps, enrollments, resources,
    createInterviewRequest, respondToInterview, setProcessStage,
    toggleShortlist, isShortlisted, getAvailabilityForApplicant,
    getNotificationsForUser: getNotifsForUser,
    getApplicantById: findTalentById,
    getEmployerById: findEmployer,
    updateAvailabilitySlots, initiateContract, uploadContract, getProcessById,
    setAccessRequests: setAccessRequestsState,
    setProfiles,
  }), [
    talentProfiles, profiles, employerProfiles, accessRequests,
    interviewRequests, selectionProcesses, notifications, shortlistedIds,
    availabilitySlots, bootcamps, enrollments, resources,
    createInterviewRequest, respondToInterview, setProcessStage,
    toggleShortlist, isShortlisted, getAvailabilityForApplicant,
    getNotifsForUser, findTalentById, findEmployer,
    updateAvailabilitySlots, initiateContract, uploadContract, getProcessById,
  ]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useMockData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useMockData must be used within MockDataProvider');
  return ctx;
}
