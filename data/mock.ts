import type {
  TalentProfile, TalentSkill, AccessRequest, Bootcamp, Enrollment, Resource,
  Profile, EmployerProfile, AvailabilitySlot, SelectionProcess,
  InterviewRequest, Notification, DemoUser,
} from '@/types';

// ─── Demo Users ──────────────────────────────────────────
export const demoUsers: DemoUser[] = [
  { id: 'u-admin1', email: 'admin@demo.com', password: 'Demo123!', full_name: 'Admin User', role: 'admin', profile_id: 'p-admin1' },
  { id: 'u-admin2', email: 'admin2@demo.com', password: 'Demo123!', full_name: 'Operations Admin', role: 'admin', profile_id: 'p-admin2' },
  { id: 'u-sofia', email: 'sofia.backend@demo.com', password: 'Demo123!', full_name: 'Sofia Ramirez', role: 'applicant', profile_id: 'p-sofia', talent_profile_id: 'tp-sofia' },
  { id: 'u-daniel', email: 'daniel.ai@demo.com', password: 'Demo123!', full_name: 'Daniel Torres', role: 'applicant', profile_id: 'p-daniel', talent_profile_id: 'tp-daniel' },
  { id: 'u-camila', email: 'camila.csharp@demo.com', password: 'Demo123!', full_name: 'Camila Vega', role: 'applicant', profile_id: 'p-camila', talent_profile_id: 'tp-camila' },
  { id: 'u-juan', email: 'juan.fullstack@demo.com', password: 'Demo123!', full_name: 'Juan Herrera', role: 'applicant', profile_id: 'p-juan', talent_profile_id: 'tp-juan' },
  { id: 'u-acme', email: 'talent@acme.com', password: 'Demo123!', full_name: 'ACME Hiring Team', role: 'employer', profile_id: 'p-acme', employer_profile_id: 'ep-acme' },
  { id: 'u-innova', email: 'hr@innovasoft.com', password: 'Demo123!', full_name: 'InnovaSoft Recruiting', role: 'employer', profile_id: 'p-innova', employer_profile_id: 'ep-innova' },
  { id: 'u-next', email: 'hiring@nextlayer.com', password: 'Demo123!', full_name: 'NextLayer Talent Team', role: 'employer', profile_id: 'p-next', employer_profile_id: 'ep-next' },
];

// ─── Profiles ────────────────────────────────────────────
export const mockProfiles: Profile[] = [
  { id: 'p-admin1', auth_user_id: 'auth-admin1', full_name: 'Admin User', email: 'admin@demo.com', role: 'admin', company_name: 'VeneHire', status: 'active', created_at: '2024-01-01' },
  { id: 'p-admin2', auth_user_id: 'auth-admin2', full_name: 'Operations Admin', email: 'admin2@demo.com', role: 'admin', company_name: 'VeneHire', status: 'active', created_at: '2024-01-01' },
  { id: 'p-sofia', auth_user_id: 'auth-sofia', full_name: 'Sofia Ramirez', email: 'sofia.backend@demo.com', role: 'applicant', company_name: null, status: 'active', created_at: '2024-02-01' },
  { id: 'p-daniel', auth_user_id: 'auth-daniel', full_name: 'Daniel Torres', email: 'daniel.ai@demo.com', role: 'applicant', company_name: null, status: 'active', created_at: '2024-02-05' },
  { id: 'p-camila', auth_user_id: 'auth-camila', full_name: 'Camila Vega', email: 'camila.csharp@demo.com', role: 'applicant', company_name: null, status: 'active', created_at: '2024-02-10' },
  { id: 'p-juan', auth_user_id: 'auth-juan', full_name: 'Juan Herrera', email: 'juan.fullstack@demo.com', role: 'applicant', company_name: null, status: 'active', created_at: '2024-02-15' },
  { id: 'p-acme', auth_user_id: 'auth-acme', full_name: 'ACME Hiring Team', email: 'talent@acme.com', role: 'employer', company_name: 'ACME Corp', status: 'active', created_at: '2024-03-01' },
  { id: 'p-innova', auth_user_id: 'auth-innova', full_name: 'InnovaSoft Recruiting', email: 'hr@innovasoft.com', role: 'employer', company_name: 'InnovaSoft', status: 'active', created_at: '2024-03-05' },
  { id: 'p-next', auth_user_id: 'auth-next', full_name: 'NextLayer Talent Team', email: 'hiring@nextlayer.com', role: 'employer', company_name: 'NextLayer', status: 'active', created_at: '2024-03-10' },
];

// ─── Employer Profiles ───────────────────────────────────
export const mockEmployerProfiles: EmployerProfile[] = [
  { id: 'ep-acme', user_id: 'p-acme', company_name: 'ACME Corp', contact_name: 'Sarah Johnson', summary: 'Global technology company building enterprise SaaS solutions. We are scaling our engineering team across multiple product lines.', hiring_needs: 'Backend Engineers, Full Stack Developers, DevOps Engineers', status: 'active', created_at: '2024-03-01' },
  { id: 'ep-innova', user_id: 'p-innova', company_name: 'InnovaSoft', contact_name: 'Ricardo Mendez', summary: 'AI-first startup developing next-generation analytics and automation tools for the financial services industry.', hiring_needs: 'AI Engineers, Python Developers, Data Engineers', status: 'active', created_at: '2024-03-05' },
  { id: 'ep-next', user_id: 'p-next', company_name: 'NextLayer', contact_name: 'Michael Chen', summary: 'Cloud infrastructure company providing scalable solutions for mid-market companies in Latin America and the US.', hiring_needs: 'Cloud Engineers, C#/.NET Developers, React Developers', status: 'active', created_at: '2024-03-10' },
];

// ─── Talent / Applicant Profiles ─────────────────────────
export const mockTalentProfiles: (TalentProfile & { skills: TalentSkill[] })[] = [
  {
    id: 'tp-sofia', user_id: 'p-sofia', slug: 'sofia-ramirez',
    display_name: 'Sofia Ramirez', title: 'Backend Engineer',
    summary: 'Backend engineer with 4 years of experience building high-performance APIs and microservices. Expert in Python, Node.js, and cloud infrastructure.',
    bio: 'Sofia brings a strong background in systems engineering and distributed computing. She has designed and implemented APIs handling millions of requests daily. Her experience spans fintech and e-commerce domains, where reliability and performance are critical. In the accelerator program, she architected a real-time payment processing system that handled concurrent transactions flawlessly.',
    tech_stack: ['Python', 'Node.js', 'PostgreSQL', 'Redis', 'AWS', 'Docker'],
    english_level: 'Advanced', availability_status: 'Available', years_experience: 4,
    featured: true, public_visible: true,
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    profile_image_url: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=400',
    resume_url: '/resumes/sofia-ramirez.pdf', timezone: 'America/Bogota', profile_completion: 95,
    created_at: '2024-02-01',
    skills: [
      { id: 's1', talent_profile_id: 'tp-sofia', skill_name: 'Python', score: 95, display_order: 1 },
      { id: 's2', talent_profile_id: 'tp-sofia', skill_name: 'Node.js', score: 88, display_order: 2 },
      { id: 's3', talent_profile_id: 'tp-sofia', skill_name: 'PostgreSQL', score: 90, display_order: 3 },
      { id: 's4', talent_profile_id: 'tp-sofia', skill_name: 'AWS', score: 82, display_order: 4 },
      { id: 's5', talent_profile_id: 'tp-sofia', skill_name: 'Docker', score: 85, display_order: 5 },
    ],
  },
  {
    id: 'tp-daniel', user_id: 'p-daniel', slug: 'daniel-torres',
    display_name: 'Daniel Torres', title: 'AI Engineer',
    summary: 'AI/ML engineer specializing in NLP, computer vision, and production ML systems. Passionate about deploying models that solve real business problems.',
    bio: 'Daniel has worked on ML pipelines processing terabytes of data for training and inference. He combines strong software engineering fundamentals with deep knowledge of ML frameworks and deployment infrastructure.',
    tech_stack: ['Python', 'TensorFlow', 'PyTorch', 'FastAPI', 'AWS SageMaker', 'Docker'],
    english_level: 'Fluent', availability_status: 'Available', years_experience: 5,
    featured: true, public_visible: true,
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    profile_image_url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
    resume_url: '/resumes/daniel-torres.pdf', timezone: 'America/Caracas', profile_completion: 100,
    created_at: '2024-02-05',
    skills: [
      { id: 's6', talent_profile_id: 'tp-daniel', skill_name: 'Python', score: 96, display_order: 1 },
      { id: 's7', talent_profile_id: 'tp-daniel', skill_name: 'TensorFlow', score: 90, display_order: 2 },
      { id: 's8', talent_profile_id: 'tp-daniel', skill_name: 'PyTorch', score: 88, display_order: 3 },
      { id: 's9', talent_profile_id: 'tp-daniel', skill_name: 'MLOps', score: 85, display_order: 4 },
      { id: 's10', talent_profile_id: 'tp-daniel', skill_name: 'NLP', score: 92, display_order: 5 },
    ],
  },
  {
    id: 'tp-camila', user_id: 'p-camila', slug: 'camila-vega',
    display_name: 'Camila Vega', title: 'C# / .NET Developer',
    summary: 'Experienced C# and .NET developer building enterprise applications, REST APIs, and microservices with Azure cloud infrastructure.',
    bio: 'Camila has 3 years of experience developing enterprise-grade applications using .NET Core and Azure. She has built payment gateways, inventory management systems, and internal tooling.',
    tech_stack: ['C#', '.NET', 'Azure', 'SQL Server', 'Entity Framework', 'Docker'],
    english_level: 'Advanced', availability_status: 'Available', years_experience: 3,
    featured: true, public_visible: true,
    video_url: null,
    profile_image_url: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=400',
    resume_url: '/resumes/camila-vega.pdf', timezone: 'America/Santiago', profile_completion: 80,
    created_at: '2024-02-10',
    skills: [
      { id: 's11', talent_profile_id: 'tp-camila', skill_name: 'C#', score: 92, display_order: 1 },
      { id: 's12', talent_profile_id: 'tp-camila', skill_name: '.NET Core', score: 90, display_order: 2 },
      { id: 's13', talent_profile_id: 'tp-camila', skill_name: 'Azure', score: 85, display_order: 3 },
      { id: 's14', talent_profile_id: 'tp-camila', skill_name: 'SQL Server', score: 88, display_order: 4 },
      { id: 's15', talent_profile_id: 'tp-camila', skill_name: 'Docker', score: 78, display_order: 5 },
    ],
  },
  {
    id: 'tp-juan', user_id: 'p-juan', slug: 'juan-herrera',
    display_name: 'Juan Herrera', title: 'Full Stack Developer',
    summary: 'Versatile full stack developer with a focus on React, Node.js, and cloud services. Experience across healthcare, fintech, and education sectors.',
    bio: 'Juan is a highly adaptable engineer who thrives in fast-paced environments. He completed the accelerator program with the highest project evaluation scores in his cohort.',
    tech_stack: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'GraphQL'],
    english_level: 'Fluent', availability_status: 'Available', years_experience: 4,
    featured: true, public_visible: true,
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    profile_image_url: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
    resume_url: '/resumes/juan-herrera.pdf', timezone: 'America/Bogota', profile_completion: 90,
    created_at: '2024-02-15',
    skills: [
      { id: 's16', talent_profile_id: 'tp-juan', skill_name: 'React', score: 93, display_order: 1 },
      { id: 's17', talent_profile_id: 'tp-juan', skill_name: 'Node.js', score: 90, display_order: 2 },
      { id: 's18', talent_profile_id: 'tp-juan', skill_name: 'TypeScript', score: 92, display_order: 3 },
      { id: 's19', talent_profile_id: 'tp-juan', skill_name: 'GraphQL', score: 85, display_order: 4 },
      { id: 's20', talent_profile_id: 'tp-juan', skill_name: 'AWS', score: 80, display_order: 5 },
    ],
  },
  {
    id: 'tp-ana', user_id: null, slug: 'ana-martinez',
    display_name: 'Ana Martinez', title: 'Frontend Engineer',
    summary: 'Creative frontend engineer specializing in building beautiful, accessible, and performant web applications with modern frameworks.',
    bio: 'Ana combines strong design sensibility with deep technical expertise. She has built design systems used by teams of 20+ developers.',
    tech_stack: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Figma', 'Storybook'],
    english_level: 'Advanced', availability_status: 'In Training', years_experience: 3,
    featured: false, public_visible: true, video_url: null,
    profile_image_url: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=400',
    resume_url: null, timezone: 'America/Lima', profile_completion: 60,
    created_at: '2024-03-01',
    skills: [
      { id: 's21', talent_profile_id: 'tp-ana', skill_name: 'React', score: 95, display_order: 1 },
      { id: 's22', talent_profile_id: 'tp-ana', skill_name: 'TypeScript', score: 90, display_order: 2 },
      { id: 's23', talent_profile_id: 'tp-ana', skill_name: 'CSS/Tailwind', score: 96, display_order: 3 },
      { id: 's24', talent_profile_id: 'tp-ana', skill_name: 'Next.js', score: 88, display_order: 4 },
    ],
  },
  {
    id: 'tp-diego', user_id: null, slug: 'diego-ramirez',
    display_name: 'Diego Ramirez', title: 'Cloud / DevOps Engineer',
    summary: 'DevOps specialist with experience in cloud infrastructure, CI/CD pipelines, and container orchestration for production systems.',
    bio: 'Diego has managed infrastructure for applications serving hundreds of thousands of users.',
    tech_stack: ['AWS', 'Terraform', 'Kubernetes', 'Docker', 'GitHub Actions', 'Prometheus'],
    english_level: 'Advanced', availability_status: 'On Hold', years_experience: 5,
    featured: false, public_visible: true, video_url: null,
    profile_image_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    resume_url: null, timezone: 'America/Mexico_City', profile_completion: 55,
    created_at: '2024-03-10',
    skills: [
      { id: 's25', talent_profile_id: 'tp-diego', skill_name: 'AWS', score: 93, display_order: 1 },
      { id: 's26', talent_profile_id: 'tp-diego', skill_name: 'Terraform', score: 90, display_order: 2 },
      { id: 's27', talent_profile_id: 'tp-diego', skill_name: 'Kubernetes', score: 88, display_order: 3 },
      { id: 's28', talent_profile_id: 'tp-diego', skill_name: 'Docker', score: 92, display_order: 4 },
    ],
  },
  {
    id: 'tp-santiago', user_id: null, slug: 'santiago-herrera',
    display_name: 'Santiago Herrera', title: 'Java Backend Developer',
    summary: 'Enterprise Java developer building robust microservices and APIs with Spring Boot, Kafka, and cloud-native architectures.',
    bio: 'Santiago has 4 years working in large-scale enterprise environments building resilient microservice architectures.',
    tech_stack: ['Java', 'Spring Boot', 'Kafka', 'PostgreSQL', 'AWS', 'Docker'],
    english_level: 'Intermediate', availability_status: 'Available', years_experience: 4,
    featured: false, public_visible: true, video_url: null,
    profile_image_url: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
    resume_url: null, timezone: 'America/Buenos_Aires', profile_completion: 65,
    created_at: '2024-03-15',
    skills: [
      { id: 's29', talent_profile_id: 'tp-santiago', skill_name: 'Java', score: 93, display_order: 1 },
      { id: 's30', talent_profile_id: 'tp-santiago', skill_name: 'Spring Boot', score: 90, display_order: 2 },
      { id: 's31', talent_profile_id: 'tp-santiago', skill_name: 'Kafka', score: 82, display_order: 3 },
      { id: 's32', talent_profile_id: 'tp-santiago', skill_name: 'PostgreSQL', score: 88, display_order: 4 },
    ],
  },
  {
    id: 'tp-valentina', user_id: null, slug: 'valentina-lopez',
    display_name: 'Valentina Lopez', title: 'React / Frontend Developer',
    summary: 'Frontend developer crafting high-quality, accessible web applications with React, TypeScript, and modern CSS architectures.',
    bio: 'Valentina has shipped 5 production applications and excels at building smooth, responsive interfaces.',
    tech_stack: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux', 'Testing Library'],
    english_level: 'Fluent', availability_status: 'Available', years_experience: 3,
    featured: true, public_visible: true,
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    profile_image_url: 'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?auto=compress&cs=tinysrgb&w=400',
    resume_url: '/resumes/valentina-lopez.pdf', timezone: 'America/Bogota', profile_completion: 85,
    created_at: '2024-03-20',
    skills: [
      { id: 's33', talent_profile_id: 'tp-valentina', skill_name: 'React', score: 94, display_order: 1 },
      { id: 's34', talent_profile_id: 'tp-valentina', skill_name: 'TypeScript', score: 90, display_order: 2 },
      { id: 's35', talent_profile_id: 'tp-valentina', skill_name: 'Next.js', score: 88, display_order: 3 },
      { id: 's36', talent_profile_id: 'tp-valentina', skill_name: 'CSS/Tailwind', score: 92, display_order: 4 },
    ],
  },
];

// ─── Availability Slots ──────────────────────────────────
export const mockAvailabilitySlots: AvailabilitySlot[] = [
  { id: 'as1', applicant_id: 'tp-sofia', day_of_week: 1, start_time: '09:00', end_time: '12:00', timezone: 'America/Bogota' },
  { id: 'as2', applicant_id: 'tp-sofia', day_of_week: 3, start_time: '14:00', end_time: '17:00', timezone: 'America/Bogota' },
  { id: 'as3', applicant_id: 'tp-sofia', day_of_week: 5, start_time: '09:00', end_time: '11:00', timezone: 'America/Bogota' },
  { id: 'as4', applicant_id: 'tp-daniel', day_of_week: 1, start_time: '10:00', end_time: '13:00', timezone: 'America/Caracas' },
  { id: 'as5', applicant_id: 'tp-daniel', day_of_week: 2, start_time: '10:00', end_time: '13:00', timezone: 'America/Caracas' },
  { id: 'as6', applicant_id: 'tp-daniel', day_of_week: 4, start_time: '14:00', end_time: '17:00', timezone: 'America/Caracas' },
];

// ─── Selection Processes ─────────────────────────────────
export const mockSelectionProcesses: SelectionProcess[] = [
  { id: 'sp1', applicant_id: 'tp-sofia', employer_id: 'ep-acme', role_title: 'Senior Backend Engineer', current_stage: 'technical_interview', status: 'active', intro_interview_date: '2024-04-05T14:00:00Z', technical_interview_date: '2024-04-15T15:00:00Z', contract_status: null, notes: 'Strong intro interview. Moving to technical round.', created_at: '2024-04-01' },
  { id: 'sp2', applicant_id: 'tp-daniel', employer_id: 'ep-innova', role_title: 'AI / ML Engineer', current_stage: 'contract_signing', status: 'active', intro_interview_date: '2024-03-20T10:00:00Z', technical_interview_date: '2024-03-28T11:00:00Z', contract_status: 'under_review', notes: 'Excellent performance. Contract sent.', created_at: '2024-03-15' },
  { id: 'sp3', applicant_id: 'tp-juan', employer_id: 'ep-acme', role_title: 'Full Stack Developer', current_stage: 'intro_interview', status: 'active', intro_interview_date: '2024-04-20T16:00:00Z', technical_interview_date: null, contract_status: null, notes: 'Intro interview scheduled.', created_at: '2024-04-10' },
  { id: 'sp4', applicant_id: 'tp-camila', employer_id: 'ep-next', role_title: 'C# / .NET Developer', current_stage: 'intro_interview', status: 'on_hold', intro_interview_date: null, technical_interview_date: null, contract_status: null, notes: 'Process paused by employer.', created_at: '2024-04-05' },
  { id: 'sp5', applicant_id: 'tp-valentina', employer_id: 'ep-innova', role_title: 'Frontend Developer', current_stage: 'technical_interview', status: 'not_selected', intro_interview_date: '2024-03-10T09:00:00Z', technical_interview_date: '2024-03-18T10:00:00Z', contract_status: null, notes: 'Good candidate but looking for more senior profile.', created_at: '2024-03-05' },
];

// ─── Interview Requests ──────────────────────────────────
export const mockInterviewRequests: InterviewRequest[] = [
  { id: 'ir1', applicant_id: 'tp-sofia', employer_id: 'ep-acme', role_title: 'Senior Backend Engineer', requested_date: '2024-04-22T14:00:00Z', status: 'scheduled', message: 'We would love to discuss the senior backend role with Sofia.', created_at: '2024-04-10' },
  { id: 'ir2', applicant_id: 'tp-daniel', employer_id: 'ep-innova', role_title: 'AI / ML Engineer', requested_date: '2024-04-25T10:00:00Z', status: 'completed', message: 'Interested in Daniel for our AI team.', created_at: '2024-03-10' },
  { id: 'ir3', applicant_id: 'tp-juan', employer_id: 'ep-acme', role_title: 'Full Stack Developer', requested_date: '2024-04-20T16:00:00Z', status: 'pending', message: 'Juan looks like a great fit for our fullstack position.', created_at: '2024-04-15' },
  { id: 'ir4', applicant_id: 'tp-camila', employer_id: 'ep-next', role_title: 'C# / .NET Developer', requested_date: null, status: 'pending', message: 'Interested in Camila for .NET development work.', created_at: '2024-04-12' },
  { id: 'ir5', applicant_id: 'tp-sofia', employer_id: 'ep-innova', role_title: 'Backend Engineer', requested_date: '2024-04-28T11:00:00Z', status: 'pending', message: 'Sofia has the backend skills we need.', created_at: '2024-04-18' },
];

// ─── Access Requests ─────────────────────────────────────
export const mockAccessRequests: AccessRequest[] = [
  { id: 'ar1', request_type: 'employer', full_name: 'John Smith', company: 'TechCorp Inc.', email: 'john@techcorp.com', country: 'United States', hiring_need: 'Full Stack Developer', candidate_slug: 'sofia-ramirez', message: 'Looking for a backend engineer. Sofia looks great.', status: 'pending', created_at: '2024-04-20', reviewed_by: null },
  { id: 'ar2', request_type: 'employer', full_name: 'Sarah Johnson', company: 'StartupXYZ', email: 'sarah@startupxyz.io', country: 'Canada', hiring_need: 'Backend Engineer', candidate_slug: null, message: 'Need 2 backend engineers for our platform.', status: 'contacted', created_at: '2024-04-18', reviewed_by: null },
  { id: 'ar3', request_type: 'applicant', full_name: 'Pedro Vasquez', company: '', email: 'pedro@gmail.com', country: 'Venezuela', hiring_need: 'Backend Developer', candidate_slug: null, message: 'Backend developer with 2 years experience. Want to join the bootcamp.', status: 'pending', created_at: '2024-04-19', reviewed_by: null },
  { id: 'ar4', request_type: 'employer', full_name: 'Michael Brown', company: 'FinanceFlow', email: 'michael@financeflow.com', country: 'United Kingdom', hiring_need: 'DevOps Engineer', candidate_slug: 'diego-ramirez', message: 'Looking for a DevOps engineer.', status: 'approved', created_at: '2024-04-15', reviewed_by: null },
  { id: 'ar5', request_type: 'applicant', full_name: 'Maria Rodriguez', company: '', email: 'maria.r@outlook.com', country: 'Colombia', hiring_need: 'Frontend Developer', candidate_slug: null, message: 'Frontend developer looking for international opportunities.', status: 'approved', created_at: '2024-04-12', reviewed_by: null },
  { id: 'ar6', request_type: 'employer', full_name: 'Lisa Chen', company: 'HealthTech Solutions', email: 'lisa@healthtech.com', country: 'Australia', hiring_need: 'Mobile Developer', candidate_slug: null, message: 'Building a health monitoring app.', status: 'rejected', created_at: '2024-04-10', reviewed_by: null },
];

// ─── Notifications ───────────────────────────────────────
export const mockNotifications: Notification[] = [
  { id: 'n1', user_id: 'p-sofia', title: 'New Interview Request', message: 'ACME Corp wants to schedule an interview with you for Senior Backend Engineer.', type: 'interview', read: false, created_at: '2024-04-20T10:00:00Z' },
  { id: 'n2', user_id: 'p-sofia', title: 'Process Stage Updated', message: 'Your process with ACME Corp has moved to Technical Interview stage.', type: 'process', read: false, created_at: '2024-04-18T14:00:00Z' },
  { id: 'n3', user_id: 'p-sofia', title: 'New Interview Request', message: 'InnovaSoft is interested in interviewing you for a Backend role.', type: 'interview', read: true, created_at: '2024-04-18T09:00:00Z' },
  { id: 'n4', user_id: 'p-daniel', title: 'Contract Stage Started', message: 'InnovaSoft has initiated the contract signing process for the AI Engineer role.', type: 'contract', read: false, created_at: '2024-04-15T11:00:00Z' },
  { id: 'n5', user_id: 'p-daniel', title: 'Interview Completed', message: 'Your technical interview with InnovaSoft has been marked as completed.', type: 'interview', read: true, created_at: '2024-03-28T12:00:00Z' },
  { id: 'n6', user_id: 'p-acme', title: 'Interview Request Sent', message: 'Your interview request to Sofia Ramirez has been sent.', type: 'interview', read: false, created_at: '2024-04-20T10:30:00Z' },
  { id: 'n7', user_id: 'p-acme', title: 'New Candidate Available', message: 'Juan Herrera is now available and matches your hiring needs.', type: 'info', read: true, created_at: '2024-04-15T08:00:00Z' },
  { id: 'n8', user_id: 'p-innova', title: 'Contract Under Review', message: 'Daniel Torres is reviewing the contract for AI Engineer position.', type: 'contract', read: false, created_at: '2024-04-16T15:00:00Z' },
  { id: 'n9', user_id: 'p-admin1', title: 'New Access Request', message: 'John Smith from TechCorp Inc. submitted an employer access request.', type: 'request', read: false, created_at: '2024-04-20T09:00:00Z' },
  { id: 'n10', user_id: 'p-admin1', title: 'New Applicant Request', message: 'Pedro Vasquez submitted a bootcamp/applicant access request.', type: 'request', read: false, created_at: '2024-04-19T14:00:00Z' },
  { id: 'n11', user_id: 'p-admin1', title: 'Process Update', message: 'Daniel Torres process with InnovaSoft moved to Contract Signing.', type: 'process', read: true, created_at: '2024-04-15T12:00:00Z' },
];

// ─── Bootcamps ───────────────────────────────────────────
export const mockBootcamps: Bootcamp[] = [
  { id: 'bc1', title: 'Full Stack Web Development - Cohort 12', description: 'Intensive 12-week program covering React, Node.js, databases, and cloud deployment.', start_date: '2024-04-01', end_date: '2024-06-21', status: 'active', created_at: '2024-01-01' },
  { id: 'bc2', title: 'Backend Engineering - Cohort 8', description: 'Advanced backend development focusing on microservices, APIs, and system design.', start_date: '2024-05-01', end_date: '2024-07-19', status: 'upcoming', created_at: '2024-02-01' },
  { id: 'bc3', title: 'DevOps & Cloud Engineering - Cohort 5', description: 'Comprehensive program covering AWS, Docker, Kubernetes, CI/CD, and IaC.', start_date: '2024-01-15', end_date: '2024-03-29', status: 'completed', created_at: '2023-11-01' },
];

export const mockEnrollments: Enrollment[] = [
  { id: 'en1', student_profile_id: 'p-sofia', bootcamp_id: 'bc1', progress: 65, status: 'in_progress', created_at: '2024-04-01', bootcamp: mockBootcamps[0] },
];

export const mockResources: Resource[] = [
  { id: 'r1', title: 'React Best Practices Guide', description: 'Comprehensive guide to writing clean React code.', file_path: '/resources/react-best-practices.pdf', visibility: 'student', bootcamp_id: 'bc1', created_at: '2024-04-05' },
  { id: 'r2', title: 'Interview Preparation Handbook', description: 'Tips for technical interviews at international companies.', file_path: '/resources/interview-prep.pdf', visibility: 'student', bootcamp_id: null, created_at: '2024-03-01' },
  { id: 'r3', title: 'Hiring Process Overview', description: 'Guide for clients on evaluating and onboarding talent.', file_path: '/resources/hiring-overview.pdf', visibility: 'client', bootcamp_id: null, created_at: '2024-02-15' },
  { id: 'r4', title: 'Platform Admin Guide', description: 'Admin documentation for managing the platform.', file_path: '/resources/admin-guide.pdf', visibility: 'admin', bootcamp_id: null, created_at: '2024-01-10' },
];

// ─── Helpers ─────────────────────────────────────────────
export function getApplicantById(id: string) {
  return mockTalentProfiles.find((t) => t.id === id);
}

export function getEmployerById(id: string) {
  return mockEmployerProfiles.find((e) => e.id === id);
}

export function getProcessesForApplicant(applicantId: string) {
  return mockSelectionProcesses.filter((p) => p.applicant_id === applicantId);
}

export function getProcessesForEmployer(employerId: string) {
  return mockSelectionProcesses.filter((p) => p.employer_id === employerId);
}

export function getInterviewsForApplicant(applicantId: string) {
  return mockInterviewRequests.filter((r) => r.applicant_id === applicantId);
}

export function getInterviewsForEmployer(employerId: string) {
  return mockInterviewRequests.filter((r) => r.employer_id === employerId);
}

export function getNotificationsForUser(userId: string) {
  return mockNotifications.filter((n) => n.user_id === userId);
}
