'use client';

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import type {
  TalentProfile, InterviewRequest, SelectionProcess, Notification,
} from '@/types';
import {
  mockTalentProfiles as initialTalentProfiles,
  mockEmployerProfiles,
  mockAvailabilitySlots,
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
  toggleShortlist: (applicantId: string) => void;
  isShortlisted: (applicantId: string) => boolean;
  getAvailabilityForApplicant: (applicantId: string) => typeof mockAvailabilitySlots;
  getNotificationsForUser: (userId: string) => Notification[];
  getApplicantById: (id: string) => (TalentProfile & { skills: import('@/types').TalentSkill[] }) | undefined;
  getEmployerById: (id: string) => typeof mockEmployerProfiles[0] | undefined;
}

const MockDataContext = createContext<MockDataContextType | null>(null);

export function MockDataProvider({ children }: { children: ReactNode }) {
  const [interviewRequests, setInterviewRequests] = useState(initialInterviewRequests);
  const [selectionProcesses, setSelectionProcesses] = useState(initialProcesses);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [shortlistedIds, setShortlistedIds] = useState<string[]>(
    initialTalentProfiles.slice(0, 3).map((t) => t.id)
  );

  const createInterviewRequest = useCallback((data: NewInterviewData) => {
    const newRequest: InterviewRequest = {
      id: genId('ir-'),
      applicant_id: data.applicant_id,
      employer_id: data.employer_id,
      requested_date: data.requested_date,
      status: 'pending',
      message: data.message,
      created_at: new Date().toISOString(),
    };

    setInterviewRequests((prev) => [...prev, newRequest]);

    const applicant = initialTalentProfiles.find((t) => t.id === data.applicant_id);
    const employer = mockEmployerProfiles.find((e) => e.id === data.employer_id);
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
      const newProcess: SelectionProcess = {
        id: genId('sp-'),
        applicant_id: request.applicant_id,
        employer_id: request.employer_id,
        role_title: 'Position',
        current_stage: 'intro_interview',
        status: 'active',
        intro_interview_date: request.requested_date,
        technical_interview_date: null,
        contract_status: null,
        notes: 'Process started from interview request acceptance.',
        created_at: new Date().toISOString(),
      };
      setSelectionProcesses((prev) => [...prev, newProcess]);

      const applicant = initialTalentProfiles.find((t) => t.id === request.applicant_id);
      const employer = mockEmployerProfiles.find((e) => e.id === request.employer_id);
      const applicantUserId = applicant?.user_id;
      if (applicantUserId) {
        setNotifications((prev) => [
          ...prev,
          {
            id: genId('n-'),
            user_id: applicantUserId,
            title: 'Interview Accepted',
            message: `You accepted the interview with ${employer?.company_name || 'employer'}. A selection process has been created.`,
            type: 'process' as const,
            read: false,
            created_at: new Date().toISOString(),
          },
        ]);
      }
      const empProfile = initialTalentProfiles.find((t) => t.id === request?.applicant_id);
      const employerUserId = employer?.user_id;
      if (employerUserId) {
        setNotifications((prev) => [
          ...prev,
          {
            id: genId('n-'),
            user_id: employerUserId,
            title: 'Interview Accepted',
            message: `${empProfile?.display_name || 'Applicant'} accepted your interview request.`,
            type: 'process' as const,
            read: false,
            created_at: new Date().toISOString(),
          },
        ]);
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
  }, [interviewRequests]);

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
    return mockAvailabilitySlots.filter((s) => s.applicant_id === applicantId);
  }, []);

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
      toggleShortlist,
      isShortlisted,
      getAvailabilityForApplicant,
      getNotificationsForUser: getNotifsForUser,
      getApplicantById: (id) => initialTalentProfiles.find((t) => t.id === id),
      getEmployerById: (id) => mockEmployerProfiles.find((e) => e.id === id),
    }),
    [
      interviewRequests,
      selectionProcesses,
      notifications,
      shortlistedIds,
      createInterviewRequest,
      respondToInterview,
      toggleShortlist,
      isShortlisted,
      getAvailabilityForApplicant,
      getNotifsForUser,
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
