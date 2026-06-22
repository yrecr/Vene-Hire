'use client';

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import type {
  TalentProfile, InterviewRequest, SelectionProcess, Notification, AvailabilitySlot,
} from '@/types';
import { createZoomMeeting } from '@/lib/zoom';
import {
  mockTalentProfiles as initialTalentProfiles,
  mockEmployerProfiles,
  mockAvailabilitySlots as initialAvailabilitySlots,
  mockInterviewRequests as initialInterviewRequests,
  mockSelectionProcesses as initialProcesses,
  mockNotifications as initialNotifications,
} from '@/data/mock';

let nextId = 100;
function genId(prefix: string) {
  return `${prefix}${nextId++}`;
}

interface NewInterviewData {
  applicant_id: string;
  employer_id: string;
  role_title: string;
  requested_date: string;
  message: string;
}

interface MockDataContextType {
  interviewRequests: InterviewRequest[];
  selectionProcesses: SelectionProcess[];
  notifications: Notification[];
  shortlistedIds: string[];
  createInterviewRequest: (data: NewInterviewData) => void;
  respondToInterview: (requestId: string, status: 'accepted' | 'declined') => void;
  setProcessStage: (processId: string, stage: 'technical_interview', date: string) => void;
  toggleShortlist: (applicantId: string) => void;
  isShortlisted: (applicantId: string) => boolean;
  getAvailabilityForApplicant: (applicantId: string) => AvailabilitySlot[];
  getNotificationsForUser: (userId: string) => Notification[];
  getApplicantById: (id: string) => (TalentProfile & { skills: import('@/types').TalentSkill[] }) | undefined;
  getEmployerById: (id: string) => typeof mockEmployerProfiles[0] | undefined;
  updateAvailabilitySlots: (applicantId: string, slots: AvailabilitySlot[]) => void;
  initiateContract: (processId: string) => void;
  uploadContract: (processId: string) => void;
  getProcessById: (processId: string) => SelectionProcess | undefined;
}

const MockDataContext = createContext<MockDataContextType | null>(null);

export function MockDataProvider({ children }: { children: ReactNode }) {
  const [interviewRequests, setInterviewRequests] = useState(initialInterviewRequests);
  const [selectionProcesses, setSelectionProcesses] = useState(initialProcesses);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [shortlistedIds, setShortlistedIds] = useState<string[]>(
    initialTalentProfiles.slice(0, 3).map((t) => t.id)
  );
  const [availabilitySlots, setAvailabilitySlots] = useState(initialAvailabilitySlots);

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

    const applicant = initialTalentProfiles.find((t) => t.id === data.applicant_id);
    const employer = mockEmployerProfiles.find((e) => e.id === data.employer_id);

    createZoomMeeting({
      topic: data.role_title,
      start_time: data.requested_date,
      interview_id: newRequest.id,
      applicant_name: applicant?.display_name,
      employer_name: employer?.company_name,
    }).then((meeting) => {
      setInterviewRequests((prev) =>
        prev.map((r) =>
          r.id === newRequest.id ? { ...r, meeting_url: meeting.join_url } : r
        )
      );
    });

    const userId = applicant?.user_id;
    if (userId) {
      const newNotif: Notification = {
        id: genId('n-'),
        user_id: userId,
        title: 'New Interview Request',
        message: `${employer?.company_name || 'An employer'} wants to schedule an interview for ${data.role_title}.`,
        type: 'interview',
        read: false,
        created_at: new Date().toISOString(),
      };
      setNotifications((prev) => [...prev, newNotif]);
    }
  }, []);

  const respondToInterview = useCallback((requestId: string, status: 'accepted' | 'declined') => {
    setInterviewRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status } : req
      )
    );

    const request = interviewRequests.find((r) => r.id === requestId) ?? 
      initialInterviewRequests.find((r) => r.id === requestId);

    if (status === 'accepted' && request) {
      const isTechnical = request.role_title.startsWith('Technical Interview - ');
      const existingProcess = !isTechnical ? null : selectionProcesses.find(
        (p) => p.applicant_id === request.applicant_id && p.employer_id === request.employer_id
      );
      const newProcess: SelectionProcess = {
        id: genId('sp-'),
        applicant_id: request.applicant_id,
        employer_id: request.employer_id,
        role_title: request.role_title,
        current_stage: 'intro_interview',
        status: 'active',
        intro_interview_date: request.requested_date,
        technical_interview_date: null,
        meeting_url: request.meeting_url,
        contract_status: null,
        notes: 'Process started from interview request acceptance.',
        created_at: new Date().toISOString(),
      };
      // ponytail: skip duplicate process for technical interview acceptance
      if (!existingProcess) setSelectionProcesses((prev) => [...prev, newProcess]);

      const applicant = initialTalentProfiles.find((t) => t.id === request.applicant_id);
      const employer = mockEmployerProfiles.find((e) => e.id === request.employer_id);
      const applicantUserId = applicant?.user_id;
      if (applicantUserId) {
        setNotifications((prev) => [...prev, {
          id: genId('n-'), user_id: applicantUserId,
          title: existingProcess ? 'Technical Interview Accepted' : 'Interview Accepted',
          message: existingProcess
            ? `You accepted the technical interview with ${employer?.company_name || 'employer'} for ${request.role_title}.`
            : `You accepted the interview with ${employer?.company_name || 'employer'}. A selection process has been created.`,
          type: 'interview' as const, read: false, created_at: new Date().toISOString(),
        }]);
      }
      const empProfile = initialTalentProfiles.find((t) => t.id === request?.applicant_id);
      const employerUserId = employer?.user_id;
      if (employerUserId) {
        setNotifications((prev) => [...prev, {
          id: genId('n-'), user_id: employerUserId,
          title: existingProcess ? 'Technical Interview Accepted' : 'Interview Accepted',
          message: existingProcess
            ? `${applicant?.display_name || 'Applicant'} accepted the technical interview.`
            : `${empProfile?.display_name || 'Applicant'} accepted your interview request.`,
          type: 'process' as const, read: false, created_at: new Date().toISOString(),
        }]);
      }
    } else if (status === 'declined' && request) {
      const applicant = initialTalentProfiles.find((t) => t.id === request.applicant_id);
      const employer = mockEmployerProfiles.find((e) => e.id === request.employer_id);
      const employerUserId = employer?.user_id;
      if (employerUserId) {
        setNotifications((prev) => [
          ...prev,
          {
            id: genId('n-'),
            user_id: employerUserId,
            title: 'Interview Declined',
            message: `${applicant?.display_name || 'Applicant'} declined your interview request.`,
            type: 'interview' as const,
            read: false,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    }
  }, [interviewRequests, selectionProcesses]);

  const setProcessStage = useCallback((processId: string, stage: 'technical_interview', date: string) => {
    setSelectionProcesses((prev) =>
      prev.map((p) =>
        p.id === processId
          ? {
              ...p,
              current_stage: stage,
              technical_interview_date: date,
              notes: p.notes || `Technical interview scheduled.`,
            }
          : p
      )
    );
    const process = selectionProcesses.find((p) => p.id === processId) ?? initialProcesses.find((p) => p.id === processId);
    if (!process) return;
    const techInterviewReq: InterviewRequest = {
      id: genId('ir-tech-'),
      applicant_id: process.applicant_id,
      employer_id: process.employer_id,
      role_title: `Technical Interview - ${process.role_title}`,
      requested_date: date,
      status: 'pending',
      message: `Technical interview scheduled for ${process.role_title} position.`,
      created_at: new Date().toISOString(),
    };
    setInterviewRequests((prev) => [...prev, techInterviewReq]);

    const applicant = initialTalentProfiles.find((t) => t.id === process.applicant_id);
    const employer = mockEmployerProfiles.find((e) => e.id === process.employer_id);

    createZoomMeeting({
      topic: techInterviewReq.role_title,
      start_time: date,
      interview_id: techInterviewReq.id,
      applicant_name: applicant?.display_name,
      employer_name: employer?.company_name,
    }).then((meeting) => {
      setInterviewRequests((prev) =>
        prev.map((r) =>
          r.id === techInterviewReq.id ? { ...r, meeting_url: meeting.join_url } : r
        )
      );
    });
  }, [selectionProcesses]);

  const toggleShortlist = useCallback((applicantId: string) => {
    setShortlistedIds((prev) =>
      prev.includes(applicantId)
        ? prev.filter((id) => id !== applicantId)
        : [...prev, applicantId]
    );
  }, []);

  const isShortlisted = useCallback(
    (applicantId: string) => shortlistedIds.includes(applicantId),
    [shortlistedIds]
  );

  const getAvailabilityForApplicant = useCallback((applicantId: string) => {
    return availabilitySlots.filter((s) => s.applicant_id === applicantId);
  }, [availabilitySlots]);

  const updateAvailabilitySlots = useCallback((applicantId: string, slots: AvailabilitySlot[]) => {
    setAvailabilitySlots((prev) => [
      ...prev.filter((s) => s.applicant_id !== applicantId),
      ...slots,
    ]);
  }, []);

  const initiateContract = useCallback((processId: string) => {
    setSelectionProcesses((prev) =>
      prev.map((p) =>
        p.id === processId
          ? { ...p, current_stage: 'contract_signing', contract_status: 'pending', notes: p.notes || 'Contract initiated by employer.' }
          : p
      )
    );
    const process = selectionProcesses.find((p) => p.id === processId) ?? initialProcesses.find((p) => p.id === processId);
    if (!process) return;
    const applicant = initialTalentProfiles.find((t) => t.id === process.applicant_id);
    const employer = mockEmployerProfiles.find((e) => e.id === process.employer_id);
    const applicantUserId = applicant?.user_id;
    if (applicantUserId) {
      setNotifications((prev) => [...prev, {
        id: genId('n-'), user_id: applicantUserId,
        title: 'Contract Ready for Review',
        message: `${employer?.company_name || 'The employer'} has initiated contract signing for ${process.role_title}.`,
        type: 'contract' as const, read: false, created_at: new Date().toISOString(),
      }]);
    }
    setNotifications((prev) => [...prev, {
      id: genId('n-'), user_id: 'p-admin1',
      title: 'Contract Upload Required',
      message: `Contract for ${applicant?.display_name || 'candidate'} at ${employer?.company_name || 'company'} needs to be uploaded.`,
      type: 'contract' as const, read: false, created_at: new Date().toISOString(),
    }]);
  }, [selectionProcesses]);

  const uploadContract = useCallback((processId: string) => {
    setSelectionProcesses((prev) =>
      prev.map((p) =>
        p.id === processId ? { ...p, contract_status: 'signed', status: 'hired' } : p
      )
    );
  }, []);

  const getProcessById = useCallback((processId: string) => {
    return selectionProcesses.find((p) => p.id === processId) ?? initialProcesses.find((p) => p.id === processId);
  }, [selectionProcesses]);

  const getNotifsForUser = useCallback(
    (userId: string) => notifications.filter((n) => n.user_id === userId),
    [notifications]
  );

  const value = useMemo<MockDataContextType>(
    () => ({
      interviewRequests,
      selectionProcesses,
      notifications,
      shortlistedIds,
      createInterviewRequest,
      respondToInterview,
      setProcessStage,
      toggleShortlist,
      isShortlisted,
      getAvailabilityForApplicant,
      getNotificationsForUser: getNotifsForUser,
      getApplicantById: (id) => initialTalentProfiles.find((t) => t.id === id),
      getEmployerById: (id) => mockEmployerProfiles.find((e) => e.id === id),
      updateAvailabilitySlots,
      initiateContract,
      uploadContract,
      getProcessById,
    }),
    [
      interviewRequests,
      selectionProcesses,
      notifications,
      shortlistedIds,
      createInterviewRequest,
      respondToInterview,
      setProcessStage,
      toggleShortlist,
      isShortlisted,
      getAvailabilityForApplicant,
      getNotifsForUser,
      updateAvailabilitySlots,
      initiateContract,
      uploadContract,
      getProcessById,
    ]
  );

  return (
    <MockDataContext.Provider value={value}>
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData() {
  const ctx = useContext(MockDataContext);
  if (!ctx) throw new Error('useMockData must be used within MockDataProvider');
  return ctx;
}
