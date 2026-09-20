'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/section-header';
import { TalentCard } from '@/components/talent-card';
import { ProfileAvatar } from '@/components/profile-avatar';
import { TalentCarousel } from '@/components/talent-carousel';
import { Reveal } from '@/components/reveal';
import { useData } from '@/lib/data-context';
import { useT } from '@/lib/i18n';
import {
  ArrowRight,
  Clock,
  ShieldCheck,
  Users,
  Search,
  Play,
  MessageSquare,
  Rocket,
  CircleCheck as CheckCircle2,
  Target,
  GitBranch,
  Code as Code2,
  UserCheck,
  Layers,
  Award,
} from 'lucide-react';

export default function HomePage() {
  const { talentProfiles } = useData();
  const { t } = useT();
  const featuredTalent = talentProfiles.filter((t) => t.featured);

  const trustItems = [
    { icon: ShieldCheck, label: t.home.trust1Label, value: t.home.trust1Value },
    { icon: Clock, label: t.home.trust2Label, value: t.home.trust2Value },
    { icon: Users, label: t.home.trust3Label, value: t.home.trust3Value },
    { icon: Target, label: t.home.trust4Label, value: t.home.trust4Value },
  ];

  const steps = [
    { icon: Search, title: t.home.step1Title, description: t.home.step1Desc },
    { icon: Play, title: t.home.step2Title, description: t.home.step2Desc },
    { icon: MessageSquare, title: t.home.step3Title, description: t.home.step3Desc },
    { icon: Rocket, title: t.home.step4Title, description: t.home.step4Desc },
  ];

  const leadValueProp = {
    icon: CheckCircle2,
    title: t.home.leadValueTitle,
    description: t.home.leadValueDesc,
  };

  const supportingValueProps = [
    { icon: ShieldCheck, title: t.home.vp1Title, description: t.home.vp1Desc },
    { icon: Users, title: t.home.vp2Title, description: t.home.vp2Desc },
    { icon: Clock, title: t.home.vp3Title, description: t.home.vp3Desc },
  ];

  const bootcampFeatures = [
    { icon: Code2, title: t.home.feat1Title, description: t.home.feat1Desc },
    { icon: GitBranch, title: t.home.feat2Title, description: t.home.feat2Desc },
    { icon: UserCheck, title: t.home.feat3Title, description: t.home.feat3Desc },
    { icon: Layers, title: t.home.feat4Title, description: t.home.feat4Desc },
    { icon: Target, title: t.home.feat5Title, description: t.home.feat5Desc },
    { icon: Award, title: t.home.feat6Title, description: t.home.feat6Desc },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-teal-50/50 dark:from-blue-950/20 dark:via-background dark:to-teal-950/20 -z-10" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/40 to-teal-100/30 dark:from-blue-900/20 dark:to-teal-900/10 rounded-full blur-3xl -z-10 animate-drift-slow" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-teal-100/30 to-blue-100/20 dark:from-teal-900/10 dark:to-blue-900/20 rounded-full blur-3xl -z-10 animate-drift-slower" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="animate-fade-in-up">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[hsl(210,100%,45%)] bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300 rounded-full mb-6">
                {t.home.heroBadge}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1]">
                {t.home.heroTitle}{' '}
                <span className="text-[hsl(210,100%,45%)]">{t.home.heroTitleHighlight}</span>
              </h1>
              <p className="mt-6 text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-lg">
                {t.home.heroSubtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/request-sign-up">
                  <Button size="lg" className="bg-gradient-to-r from-[hsl(210,100%,45%)] to-[hsl(210,100%,38%)] hover:from-[hsl(210,100%,40%)] hover:to-[hsl(210,100%,33%)] text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all text-base px-8 h-12">
                    {t.home.registerCta} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/talent">
                  <Button variant="outline" size="lg" className="text-base px-8 h-12 border-gray-200 hover:bg-gray-50">
                    {t.home.browseTalentCta}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative animate-fade-in-up stagger-2 hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-100/50 to-teal-100/50 dark:from-blue-900/20 dark:to-teal-900/20 rounded-3xl blur-2xl" />
                <div className="relative bg-white rounded-2xl shadow-2xl shadow-gray-200/60 dark:shadow-black/60 border border-gray-100 p-6 space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="ml-2 text-xs text-muted-foreground">{t.home.talentDashboard}</span>
                  </div>
                  {featuredTalent.slice(0, 3).map((talent, i) => (
                    <div key={talent.id} className={`flex items-center gap-4 p-3 rounded-xl bg-gray-50/80 animate-fade-in-up stagger-${i + 2}`}>
                      <ProfileAvatar
                        src={talent.profile_image_url}
                        name={talent.display_name}
                        className="w-10 h-10 rounded-xl"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{talent.display_name}</p>
                        <p className="text-xs text-muted-foreground">{talent.title}</p>
                      </div>
                      <span className="px-2.5 py-1 text-[10px] font-medium bg-emerald-50 text-emerald-600 rounded-full">
                        {t.badges.available}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t.home.showingEngineers.replace('{total}', String(talentProfiles.length))}</span>
                    <Link href="/talent" className="text-[hsl(210,100%,45%)] font-medium hover:underline">
                      {t.home.viewAllTalent}
                    </Link>
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
              title={t.home.howItWorksTitle}
              description={t.home.howItWorksSubtitle}
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
                    {t.common.details} {i + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
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
              title={t.home.discoverMoreTitle}
              description={t.home.discoverMoreSubtitle}
            />
          </div>
        </Reveal>
        <TalentCarousel talents={talentProfiles} />
      </section>

      {/* Value Proposition */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              title={t.home.valuePropHeaderTitle}
              description={t.home.valuePropHeaderSubtitle}
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
                {t.home.bootcampTitle}{' '}
                <span className="text-teal-400">{t.home.bootcampTitleHighlight}</span>
              </h2>
              <p className="mt-4 text-lg text-gray-400 dark:text-slate-300 leading-relaxed">
                {t.home.bootcampSubtitle}
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
                  <p className="text-sm text-gray-400 dark:text-slate-300 leading-relaxed">{feature.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-gray-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              title={t.home.topEngineersTitle}
              description={t.home.topEngineersSubtitle}
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
                {t.home.viewAllTalentBtn} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-28 bg-white">
        <Reveal className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight mb-6">
            {t.home.finalCtaTitle}{' '}
            <span className="text-[hsl(210,100%,45%)]">{t.home.finalCtaHighlight}</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            {t.home.finalCtaSubtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/request-sign-up">
              <Button size="lg" className="bg-gradient-to-r from-[hsl(210,100%,45%)] to-[hsl(210,100%,38%)] hover:from-[hsl(210,100%,40%)] hover:to-[hsl(210,100%,33%)] text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all text-base px-8 h-12">
                {t.home.registerCta} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/talent">
              <Button variant="outline" size="lg" className="text-base px-8 h-12 border-gray-200 hover:bg-gray-50">
                {t.home.browseTalentCta}
              </Button>
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
