'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/section-header';
import { TalentCard } from '@/components/talent-card';
import { TalentCarousel } from '@/components/talent-carousel';
import { Reveal } from '@/components/reveal';
import { useData } from '@/lib/data-context';
import { ArrowRight, Clock, ShieldCheck, Users, Search, Play, MessageSquare, Rocket, CircleCheck as CheckCircle2, ChartBar as BarChart3, Target, GitBranch, Code as Code2, UserCheck, TrendingUp, Layers, Award } from 'lucide-react';

const trustItems = [
  { icon: Clock, label: 'Faster Hiring', value: 'Pre-Screened' },
  { icon: ShieldCheck, label: 'Pre-Evaluated', value: 'Every Engineer' },
  { icon: Users, label: 'Curated Pool', value: 'Skill-Matched' },
  { icon: Target, label: 'Fit Assessed', value: 'Before You Meet' },
];

const steps = [
  { icon: Search, title: 'Browse Talent', description: 'Explore our curated pool of pre-trained, production-ready engineers.' },
  { icon: Play, title: 'Review Profiles', description: 'Watch intro videos and review detailed technical profiles.' },
  { icon: MessageSquare, title: 'Request Interview', description: 'Submit a demo request to start the evaluation process.' },
  { icon: Rocket, title: 'Get Started', description: 'Receive guided onboarding and integrate talent into your team.' },
];

const leadValueProp = {
  icon: CheckCircle2,
  title: 'Ready from Day One',
  description: 'Engineers trained through real-world project simulations, agile practices, and code reviews -- not textbook exercises. By the time you meet them, they have already shipped, reviewed, and iterated in a team setting.',
};

const supportingValueProps = [
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

export default function HomePage() {
  const { talentProfiles } = useData();
  const featuredTalent = talentProfiles.filter((t) => t.featured);
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-teal-50/50 -z-10" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/40 to-teal-100/30 rounded-full blur-3xl -z-10 animate-drift-slow" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-teal-100/30 to-blue-100/20 rounded-full blur-3xl -z-10 animate-drift-slower" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1]">
                Hire Production-Ready Engineers in{' '}
                <span className="text-[hsl(210,100%,45%)]">Days, Not Months</span>
              </h1>
              <p className="mt-6 text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-lg">
                Access pre-trained, pre-evaluated software engineers ready to integrate into your team from day one.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/request-sign-up">
                  <Button size="lg" className="bg-gradient-to-r from-[hsl(210,100%,45%)] to-[hsl(210,100%,38%)] hover:from-[hsl(210,100%,40%)] hover:to-[hsl(210,100%,33%)] text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all text-base px-8 h-12">
                    Request a Demo <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/talent">
                  <Button variant="outline" size="lg" className="text-base px-8 h-12 border-gray-200 hover:bg-gray-50">
                    Browse Talent
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative animate-fade-in-up stagger-2 hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-100/50 to-teal-100/50 rounded-3xl blur-2xl" />
                <div className="relative bg-white rounded-2xl shadow-2xl shadow-gray-200/60 border border-gray-100 p-6 space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="ml-2 text-xs text-muted-foreground">talent-dashboard</span>
                  </div>
                  {featuredTalent.slice(0, 3).map((talent, i) => (
                    <div key={talent.id} className={`flex items-center gap-4 p-3 rounded-xl bg-gray-50/80 animate-fade-in-up stagger-${i + 2}`}>
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
                    <span className="text-[hsl(210,100%,45%)] font-medium">View all</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-12 border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustItems.map((item, i) => (
              <Reveal key={item.label} delay={i * 60}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-[hsl(210,100%,45%)]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{item.value}</p>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              title="From Discovery to Hire in 4 Simple Steps"
              description="Our streamlined process gets you from browsing talent to integrating engineers into your team as fast as possible."
            />
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <Reveal key={step.title} delay={i * 80} className="relative group">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gradient-to-r from-gray-200 to-gray-100" />
                )}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-7 h-7 text-[hsl(210,100%,45%)]" />
                  </div>
                  <span className="text-xs font-bold text-[hsl(210,100%,45%)] uppercase tracking-wider mb-2 block">
                    Step {i + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Talent */}
      <section className="py-20 lg:py-28 bg-gray-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              title="Meet Our Top Engineers"
              description="Hand-picked, production-ready engineers who have completed our rigorous training and evaluation program."
            />
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTalent.slice(0, 6).map((talent, i) => (
              <Reveal key={talent.id} delay={i * 60}>
                <TalentCard talent={talent} />
              </Reveal>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/talent">
              <Button variant="outline" size="lg" className="px-8">
                View All Talent <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              title="The Smarter Way to Hire Engineers"
              description="Our talent accelerator model eliminates the biggest pain points in technical hiring."
              align="left"
            />
          </Reveal>
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-12">
            <Reveal className="lg:col-span-2">
              <div className="group h-full rounded-3xl bg-gradient-to-br from-[hsl(210,100%,45%)]/5 to-[hsl(170,60%,42%)]/5 border border-[hsl(210,100%,45%)]/10 p-8 lg:p-10">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <leadValueProp.icon className="w-7 h-7 text-[hsl(210,100%,45%)]" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">{leadValueProp.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{leadValueProp.description}</p>
              </div>
            </Reveal>
            <div className="lg:col-span-3 divide-y divide-gray-100">
              {supportingValueProps.map((vp, i) => (
                <Reveal key={vp.title} delay={i * 70} className="group flex gap-5 py-5 first:pt-0 last:pb-0">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <vp.icon className="w-5 h-5 text-[hsl(210,100%,45%)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{vp.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{vp.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bootcamp Differentiator */}
      <section className="py-20 lg:py-28 bg-[hsl(220,20%,7%)] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(210,100%,15%)]/30 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-14 lg:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                Not Just Recruitment.{' '}
                <span className="text-teal-400">Real Training.</span>
              </h2>
              <p className="mt-4 text-lg text-gray-400 leading-relaxed">
                Our engineers go through an intensive accelerator program that simulates real-world product development.
              </p>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-10 max-w-4xl mx-auto">
            {bootcampFeatures.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 60} className="group flex gap-4 pt-6 border-t border-white/10">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1.5">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Talent Carousel */}
      <section className="py-20 lg:py-28 bg-gray-50/70">
        <Reveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
            <SectionHeader
              title="Discover More Engineers"
              description="Browse through our growing pool of trained and evaluated software engineers."
            />
          </div>
        </Reveal>
        <TalentCarousel talents={talentProfiles} />
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-28 bg-white">
        <Reveal className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight mb-6">
            Build Your Team Faster with{' '}
            <span className="text-[hsl(210,100%,45%)]">Job-Ready Engineers</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop spending months on sourcing and screening. Our pre-trained engineers are ready to deliver from day one.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/request-sign-up">
              <Button size="lg" className="bg-gradient-to-r from-[hsl(210,100%,45%)] to-[hsl(210,100%,38%)] hover:from-[hsl(210,100%,40%)] hover:to-[hsl(210,100%,33%)] text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all text-base px-8 h-12">
                Request a Demo <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/talent">
              <Button variant="outline" size="lg" className="text-base px-8 h-12 border-gray-200 hover:bg-gray-50">
                Browse Talent
              </Button>
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
