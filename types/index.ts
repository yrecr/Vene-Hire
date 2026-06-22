export interface Profile {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'client' | 'student' | 'applicant' | 'employer';
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
  notes: string;
  created_at: string;
  applicant?: TalentProfile;
  employer?: EmployerProfile;
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
  visibility: 'all' | 'admin' | 'client' | 'student';
  bootcamp_id: string | null;
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
