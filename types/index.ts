export interface Profile {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'applicant' | 'employer';
  company_name: string | null;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
}

export interface TalentProfile {
  id: string;
  user_id: string | null;
  slug: string;
  display_name: string;
  title: string;
  summary: string;
  bio: string;
  tech_stack: string[];
  english_level: 'Basic' | 'Intermediate' | 'Advanced' | 'Fluent' | 'Native';
  availability_status: 'Available' | 'Hired' | 'In Training' | 'On Hold';
  years_experience: number;
  featured: boolean;
  public_visible: boolean;
  video_url: string | null;
  profile_image_url: string | null;
  resume_url: string | null;
  timezone: string;
  profile_completion: number;
  created_at: string;
  skills?: TalentSkill[];
}

export interface TalentSkill {
  id: string;
  talent_profile_id: string;
  skill_name: string;
  score: number;
  display_order: number;
}

export interface EmployerProfile {
  id: string;
  user_id: string | null;
  company_name: string;
  contact_name: string;
  summary: string;
  hiring_needs: string;
  status: 'active' | 'inactive' | 'pending';
  payment_method: string | null;
  payment_details: string | null;
  created_at: string;
}

export interface AvailabilitySlot {
  id: string;
  applicant_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
}

export interface SelectionProcess {
  id: string;
  applicant_id: string;
  employer_id: string;
  role_title: string;
  current_stage: 'intro_interview' | 'technical_interview' | 'contract_signing';
  status: 'active' | 'hired' | 'not_selected' | 'on_hold';
  intro_interview_date: string | null;
  technical_interview_date: string | null;
  meeting_url?: string | null;
  contract_status: 'pending' | 'under_review' | 'signed' | null;
  contract_url: string | null;
  signature_url: string | null;
  hourly_rate: number | null;
  notes: string;
  created_at: string;
  applicant?: TalentProfile;
  employer?: EmployerProfile;
}

export interface TimesheetDay {
  date: string;
  hours: number;
  note?: string;
}

export interface Timesheet {
  id: string;
  process_id: string;
  month: string;
  days: TimesheetDay[];
  total_hours: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  invoice_url: string | null;
  created_at: string;
  updated_at: string;
  process?: SelectionProcess;
}

export interface TimesheetEvent {
  id: string;
  timesheet_id: string;
  event_type: 'submitted' | 'approved' | 'rejected';
  actor_profile_id: string | null;
  comment: string | null;
  created_at: string;
}

export interface InterviewRequest {
  id: string;
  applicant_id: string;
  employer_id: string;
  role_title: string;
  requested_date: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'scheduled' | 'completed';
  message: string;
  created_at: string;
  meeting_url?: string | null;
  outcome?: 'passed' | 'failed' | null;
  outcome_notes?: string;
  applicant?: TalentProfile;
  employer?: EmployerProfile;
}

export interface AccessRequest {
  id: string;
  request_type: 'applicant' | 'employer';
  full_name: string;
  company: string;
  email: string;
  country: string;
  hiring_need: string;
  candidate_slug: string | null;
  message: string;
  status: 'pending' | 'contacted' | 'approved' | 'rejected';
  created_at: string;
  reviewed_by: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'interview' | 'process' | 'contract' | 'request';
  read: boolean;
  created_at: string;
  metadata?: {
    join_url?: string;
  };
}

export interface Bootcamp {
  id: string;
  title: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  status: 'upcoming' | 'active' | 'completed';
  created_at: string;
}

export interface Enrollment {
  id: string;
  student_profile_id: string;
  bootcamp_id: string;
  progress: number;
  status: 'enrolled' | 'in_progress' | 'completed' | 'dropped';
  created_at: string;
  bootcamp?: Bootcamp;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  file_path: string;
  visibility: 'all' | 'admin' | 'employer' | 'applicant';
  bootcamp_id: string | null;
  created_at: string;
}

export interface ContractApprovalRequest {
  id: string;
  process_id: string;
  employer_id: string;
  applicant_id: string;
  status: 'pending' | 'approved' | 'rejected';
  notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export interface Vacancy {
  id: string;
  employer_id: string;
  title: string;
  department: string;
  location: string;
  employment_type: 'Full-time' | 'Part-time' | 'Freelance';
  work_mode: 'Remote' | 'Hybrid' | 'On-site';
  status: 'Open' | 'Closed';
  published_at: string;
  created_at: string;
}

export interface Candidate {
  id: string;
  vacancy_id: string;
  name: string;
  initials: string;
  score: number;
  manual_status: 'Received' | 'Interview' | 'Offer';
  ai_status: 'Advance' | 'Hold' | 'Reject';
  applied_at: string;
  profile_summary: string;
  ai_reasoning: string;
  strengths: string[];
  improvement_areas: string[];
  ai_model: string;
  ai_response_time: string;
  ai_total_tokens: number;
  created_at: string;
}

export interface DemoUser {
  id: string;
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'applicant' | 'employer';
  profile_id: string;
  talent_profile_id?: string;
  employer_profile_id?: string;
}
