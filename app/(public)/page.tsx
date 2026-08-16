'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/section-header';
import { TalentCard } from '@/components/talent-card';
import { TalentCarousel } from '@/components/talent-carousel';
import { ValueCard } from '@/components/value-card';
import { SchedulingPreview } from '@/components/scheduling-preview';
import { useData } from '@/lib/data-context';
import { ArrowRight, Clock, ShieldCheck, Users, Search, Play, MessageSquare, Rocket, CircleCheck as CheckCircle2, ChartBar as BarChart3, Target, GitBranch, Code as Code2, UserCheck, TrendingUp, Layers, Award } from 'lucide-react';

// TODO: placeholder figures -- "Engineers Placed" and "Client Retention" are not
// backed by real data. Replace with verified numbers or drop them before launch;
// unverifiable metrics are exactly what makes competitor sites feel untrustworthy.
const trustItems = [
  { icon: Clock, label: 'Faster Hiring', value: '3x' },
  { icon: ShieldCheck, label: 'Pre-Evaluated', value: '100%' },
  { icon: Users, label: 'Engineers Placed', value: '200+' },
  { icon: Target, label: 'Client Retention', value: '95%' },
];

const steps = [
  { icon: Search, title: 'Browse Talent', description: 'Explore our curated pool of pre-trained, production-ready engineers.' },
  { icon: Play, title: 'Review Profiles', description: 'Watch intro videos and review detailed technical profiles.' },
  { icon: MessageSquare, title: 'Request Interview', description: 'Submit a demo request to start the evaluation process.' },
  { icon: Rocket, title: 'Get Started', description: 'Receive guided onboarding and integrate talent into your team.' },
];

const valueProps = [
  { icon: CheckCircle2, title: 'Ready from Day One', description: 'Engineers trained through real-world project simulations, agile practices, and code reviews.' },
  { icon: Clock, title: 'Faster Hiring Cycle', description: 'Skip the months of sourcing and screening. Our talent is pre-evaluated and interview-ready.' },
  { icon: ShieldCheck, title: 'Lower Hiring Risk', description: 'Every engineer passes rigorous technical and soft-skill evaluations before being listed.' },
  { icon: BarChart3, title: 'Pre-Evaluated Engineers', description: 'Detailed skill assessments, project portfolios, and performance metrics for every candidate.' },
  { icon: Users, title: 'Real-World Agile Simulation', description: 'Candidates work in sprint teams with standups, retrospectives, and peer code reviews.' },
  { icon: TrendingUp, title: 'Scalable Talent Pipeline', description: 'Continuous cohorts ensure a steady supply of trained engineers for growing teams.' },
];

const bootcampFeatures = [
  { icon: Code2, title: 'Production-Grade Projects', description: 'Engineers build real applications with modern tech stacks, from architecture to deployment.' },
  { icon: GitBranch, title: 'Agile & Scrum Practices', description: 'Daily standups, sprint planning, retrospectives, and cross-functional collaboration.' },
  { icon: UserCheck, title: 'Peer Code Reviews', description: 'Every PR is reviewed by peers and mentors, building habits of quality and accountability.' },
  { icon: Layers, title: 'Collaboration Tools', description: 'GitHub, Jira, Slack, Figma -- candidates learn the tools your team already uses.' },
  { icon: Target, title: 'Practical Evaluation', description: 'Performance assessed on code quality, communication, problem-solving, and teamwork.' },
  { icon: Award, title: 'Job-Readiness Focus', description: 'Technical interviews, English communication, and professional soft skills training included.' },
];

const schedulingPoints = [
  'Real availability, kept current by each engineer',
  'No scheduling emails, no timezone maths',
  'Zoom links generated the moment a slot is confirmed',
];

export default function HomePage() {
  const { talentProfiles } = useData();
  const featuredTalent = talentProfiles.filter((t) => t.featured);
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="animate-fade-in-up">
              <h1 className="text-[2.75rem] sm:text-6xl lg:text-7xl font-bold text-foreground leading-[1.08]">
                Hire production-ready engineers in days
              </h1>
              <p className="mt-6 text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-lg">
                Access pre-trained, pre-evaluated software engineers ready to integrate into your team from day one.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/request-sign-up">
                  <Button size="lg" className="text-base font-semibold px-7 h-12">
                    Request a Demo <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/talent">
                  <Button variant="outline" size="lg" className="text-base font-semibold px-7 h-12">
                    Browse Talent
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative animate-fade-in-up stagger-2 hidden lg:block">
              <div className="bg-white rounded-2xl shadow-xl shadow-foreground/[0.06] border border-border p-6 space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs text-muted-foreground">talent-dashboard</span>
                </div>
                {featuredTalent.slice(0, 3).map((talent, i) => (
                  <div key={talent.id} className={`flex items-center gap-4 p-3 rounded-xl bg-surface animate-fade-in-up stagger-${i + 2}`}>
                    <img
                      src={talent.profile_image_url || ''}
                      alt={talent.display_name}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{talent.display_name}</p>
                      <p className="text-xs text-muted-foreground">{talent.title}</p>
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-medium bg-emerald-50 text-emerald-600 rounded-full">
                      Available
                    </span>
                  </div>
                ))}
                <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Showing 3 of {talentProfiles.length} engineers</span>
                  <span className="text-primary font-semibold">View all</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-12 border-y border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustItems.map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{item.value}</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="How It Works"
            title="From discovery to hire in 4 simple steps"
            description="Our streamlined process gets you from browsing talent to integrating engineers into your team as fast as possible."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.title} className="relative group">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-border" />
                )}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-105 transition-transform duration-300">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2 block">
                    Step {i + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Scheduling band */}
          <div className="mt-20 lg:mt-28 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h3 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
                Book interviews without the back-and-forth
              </h3>
              <p className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-lg">
                Every engineer keeps their availability up to date, so you only ever see times that actually work. Pick a slot and the meeting link is created for you.
              </p>
              <ul className="mt-7 space-y-3">
                {schedulingPoints.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center lg:justify-end">
              <SchedulingPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Talent */}
      <section className="py-24 lg:py-32 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Featured Talent"
            title="Meet our top engineers"
            description="Hand-picked, production-ready engineers who have completed our rigorous training and evaluation program."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTalent.slice(0, 6).map((talent) => (
              <TalentCard key={talent.id} talent={talent} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/talent">
              <Button variant="outline" size="lg" className="px-8 font-semibold bg-white">
                View All Talent <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Why VeneHire"
            title="The smarter way to hire engineers"
            description="Our talent accelerator model eliminates the biggest pain points in technical hiring."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {valueProps.map((vp) => (
              <ValueCard key={vp.title} icon={vp.icon} title={vp.title} description={vp.description} />
            ))}
          </div>
        </div>
      </section>

      {/* Bootcamp Differentiator */}
      <section className="py-24 lg:py-32 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Our Differentiator"
            title="Not just recruitment. Real training."
            description="Our engineers go through an intensive accelerator program that simulates real-world product development."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bootcampFeatures.map((feature) => (
              <div key={feature.title} className="p-6 rounded-2xl bg-white border border-border hover:border-primary/40 transition-colors duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Talent Carousel */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <SectionHeader
            badge="Talent Pool"
            title="Discover more engineers"
            description="Browse through our growing pool of trained and evaluated software engineers."
          />
        </div>
        <TalentCarousel talents={talentProfiles} />
      </section>

      {/* Final CTA */}
      <section className="py-24 lg:py-32 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-6">
            Build your team faster
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop spending months on sourcing and screening. Our pre-trained engineers are ready to deliver from day one.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/request-sign-up">
              <Button size="lg" className="text-base font-semibold px-7 h-12">
                Request a Demo <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/talent">
              <Button variant="outline" size="lg" className="text-base font-semibold px-7 h-12 bg-white">
                Browse Talent
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
