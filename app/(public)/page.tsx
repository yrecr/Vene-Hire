'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/section-header';
import { TalentCard } from '@/components/talent-card';
import { TalentCarousel } from '@/components/talent-carousel';
import { ValueCard } from '@/components/value-card';
import { Reveal } from '@/components/scroll-reveal';
import { GhostOrb } from '@/components/ghost-orb';
import { useData } from '@/lib/data-context';
import { ArrowRight, Zap, Clock, ShieldCheck, Users, Search, Play, MessageSquare, Rocket, CircleCheck as CheckCircle2, ChartBar as BarChart3, Target, GitBranch, Code as Code2, UserCheck, TrendingUp, Layers, Award } from 'lucide-react';

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

export default function HomePage() {
  const { talentProfiles } = useData();
  const featuredTalent = talentProfiles.filter((t) => t.featured);
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-teal-50/50 -z-10" />
        <div className="absolute -z-10 top-1/2 right-[-340px] -translate-y-1/2 w-[1300px] h-[1300px] pointer-events-none hidden lg:block">
          <GhostOrb
            width="100%"
            height="100%"
            backgroundColor="transparent"
            opacity={0.7}
            colorA="#3399ff"
            colorB="#47d1ba"
            colorC="#99ccff"
            specularColorA="#ffffff"
            specularColorB="#adebe0"
            turbulence={0.22}
            noiseScale={1.4}
            flowSpeed={0.15}
            glowStrength={0.7}
            maskFeather={0.32}
            rimStrength={0.9}
            cursorLight={0.2}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="animate-fade-in-up stagger-1 inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(210,100%,45%)] bg-[hsl(210,100%,45%)]/10 rounded-full mb-6">
                Talent Accelerator Platform
              </span>
              <h1 className="animate-fade-in-up stagger-2 text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1]">
                Hire Production-Ready Engineers in{' '}
                <span className="gradient-text">Days, Not Months</span>
              </h1>
              <p className="animate-fade-in-up stagger-3 mt-6 text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-lg">
                Access pre-trained, pre-evaluated software engineers ready to integrate into your team from day one.
              </p>
              <div className="animate-fade-in-up stagger-4 mt-8 flex flex-wrap gap-4">
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
                    <div key={talent.id} className={`flex items-center gap-4 p-3 rounded-xl bg-gray-50/80 animate-fade-in-up stagger-${i + 4}`}>
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
          <Reveal className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {trustItems.map((item, i) => (
              <div key={item.label} className="reveal-item flex items-center gap-4" style={{ transitionDelay: `${i * 50}ms` }}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-[hsl(210,100%,45%)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{item.value}</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              badge="How It Works"
              title="From Discovery to Hire in 4 Simple Steps"
              description="Our streamlined process gets you from browsing talent to integrating engineers into your team as fast as possible."
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, i) => (
                <div key={step.title} className="reveal-item relative group" style={{ transitionDelay: `${i * 50}ms` }}>
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
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Featured Talent */}
      <section className="py-20 lg:py-28 bg-gray-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              badge="Featured Talent"
              title="Meet Our Top Engineers"
              description="Hand-picked, production-ready engineers who have completed our rigorous training and evaluation program."
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTalent.slice(0, 6).map((talent, i) => (
                <div key={talent.id} className="reveal-item" style={{ transitionDelay: `${i * 50}ms` }}>
                  <TalentCard talent={talent} />
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/talent">
                <Button variant="outline" size="lg" className="px-8">
                  View All Talent <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              badge="Why VeneHire"
              title="The Smarter Way to Hire Engineers"
              description="Our talent accelerator model eliminates the biggest pain points in technical hiring."
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {valueProps.map((vp, i) => (
                <div key={vp.title} className="reveal-item" style={{ transitionDelay: `${i * 50}ms` }}>
                  <ValueCard icon={vp.icon} title={vp.title} description={vp.description} />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Bootcamp Differentiator */}
      <section className="py-20 lg:py-28 bg-[hsl(220,20%,7%)] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(210,100%,15%)]/30 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-16">
              <span className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-400 bg-teal-400/10 rounded-full mb-4">
                Our Differentiator
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                Not Just Recruitment.{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">
                  Real Training.
                </span>
              </h2>
              <p className="mt-4 text-lg text-gray-400 leading-relaxed">
                Our engineers go through an intensive accelerator program that simulates real-world product development.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bootcampFeatures.map((feature, i) => (
                <div
                  key={feature.title}
                  className="reveal-item group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-teal-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Talent Carousel */}
      <section className="py-20 lg:py-28 bg-gray-50/70">
        <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <SectionHeader
            badge="Talent Pool"
            title="Discover More Engineers"
            description="Browse through our growing pool of trained and evaluated software engineers."
          />
        </Reveal>
        <TalentCarousel talents={talentProfiles} />
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-28 bg-white">
        <Reveal className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight mb-6">
            Build Your Team Faster with{' '}
            <span className="gradient-text">Job-Ready Engineers</span>
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
