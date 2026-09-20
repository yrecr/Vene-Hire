'use client';

import { enterDemo, type DemoRole } from '@/lib/demo';
import { ShieldCheck, Building2, User, Play } from 'lucide-react';

const roles: { role: DemoRole; icon: typeof ShieldCheck; title: string; description: string }[] = [
  {
    role: 'admin',
    icon: ShieldCheck,
    title: 'Administrator',
    description: 'Full platform control: manage users, review hiring processes, approve contracts, and oversee resources.',
  },
  {
    role: 'employer',
    icon: Building2,
    title: 'Employer',
    description: 'Browse talent, request interviews, manage hiring pipelines, and track active processes.',
  },
  {
    role: 'applicant',
    icon: User,
    title: 'Applicant',
    description: 'View your profile, track interview processes, manage availability, and review contracts.',
  },
];

export default function DemoPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 bg-gradient-to-br from-blue-50/80 via-white to-teal-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(210,100%,45%)] bg-[hsl(210,100%,45%)]/10 rounded-full mb-6">
            Interactive Demo
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.1] mb-4">
            Try Vene<span className="gradient-text">Hire</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Explore the platform from any role. No account needed — sample data only, nothing is saved.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid sm:grid-cols-3 gap-6">
          {roles.map(({ role, icon: Icon, title, description }) => (
            <button
              key={role}
              onClick={() => enterDemo(role)}
              className="group relative bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 text-left hover:-translate-y-1"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[hsl(210,100%,45%)]/5 to-[hsl(170,60%,42%)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-7 h-7 text-[hsl(210,100%,45%)]" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">{description}</p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-[hsl(210,100%,45%)] group-hover:gap-3 transition-all duration-300">
                  <Play className="w-4 h-4" />
                  Enter demo
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground mt-10">
          Demo sessions use sample data and expire after 24 hours. No real data is read or written.
        </p>
      </div>
    </div>
  );
}
