'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/section-header';
import { ValueCard } from '@/components/value-card';
import { useT } from '@/lib/i18n';
import {
  ArrowRight,
  Lightbulb,
  Award,
  Shield,
  Rocket,
  Building2,
  GraduationCap,
  Users,
  TrendingUp,
  CircleCheck as CheckCircle2,
} from 'lucide-react';

export function AboutClient() {
  const { t } = useT();

  const values = [
    {
      icon: Lightbulb,
      title: t.about.val1Title,
      description: t.about.val1Desc,
    },
    {
      icon: Award,
      title: t.about.val2Title,
      description: t.about.val2Desc,
    },
    {
      icon: Shield,
      title: t.about.val3Title,
      description: t.about.val3Desc,
    },
    {
      icon: Rocket,
      title: t.about.valuesTitle,
      description: t.about.valuesSubtitle,
    },
  ];

  const stats = [
    { value: t.about.stat1Value, label: t.about.stat1Label, icon: Users },
    { value: t.about.stat2Value, label: t.about.stat2Label, icon: Building2 },
    { value: t.about.stat3Value, label: t.about.stat3Label, icon: TrendingUp },
    { value: t.about.stat4Value, label: t.about.stat4Label, icon: GraduationCap },
  ];

  const forCompanies = [
    t.about.compStep1,
    t.about.compStep2,
    t.about.compStep3,
    t.about.compStep4,
  ];

  const forEngineers = [
    t.about.engStep1,
    t.about.engStep2,
    t.about.engStep3,
    t.about.engStep4,
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative pt-24 pb-20 lg:pt-36 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-teal-50/50 dark:from-blue-950/20 dark:via-background dark:to-teal-950/20 -z-10" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/40 to-teal-100/30 dark:from-blue-900/20 dark:to-teal-900/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-teal-100/30 to-blue-100/20 dark:from-teal-900/10 dark:to-blue-900/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(210,100%,45%)] bg-[hsl(210,100%,45%)]/10 rounded-full mb-6">
            {t.about.heroBadge}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1] max-w-4xl mx-auto">
            {t.about.heroTitle}{' '}
            <span className="gradient-text">VeneHire</span>
          </h1>
          <p className="mt-6 text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {t.about.heroSubtitle}
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <SectionHeader
                badge={t.about.missionBadge}
                title={t.about.missionTitle}
                align="left"
              />
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>{t.about.missionP1}</p>
                <p>{t.about.missionP2}</p>
                <p>{t.about.missionP3}</p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-100/50 to-teal-100/50 rounded-3xl blur-2xl" />
              <div className="relative bg-white rounded-2xl shadow-2xl shadow-gray-200/60 border border-gray-100 p-8">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat) => (
                    <div key={stat.label} className="text-center p-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center mx-auto mb-3">
                        <stat.icon className="w-6 h-6 text-[hsl(210,100%,45%)]" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28 bg-gray-50/70" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge={t.about.howItWorksTitle}
            title={t.about.howItWorksTitle}
            description={t.about.howItWorksSubtitle}
          />
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* For Companies */}
            <div id="for-companies" className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center mb-6">
                <Building2 className="w-7 h-7 text-[hsl(210,100%,45%)]" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t.about.forCompaniesTitle}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {t.home.leadValueDesc}
              </p>
              <ul className="space-y-3">
                {forCompanies.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[hsl(170,60%,42%)] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Engineers */}
            <div id="for-engineers" className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center mb-6">
                <GraduationCap className="w-7 h-7 text-[hsl(210,100%,45%)]" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t.about.forEngineersTitle}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {t.home.bootcampSubtitle}
              </p>
              <ul className="space-y-3">
                {forEngineers.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[hsl(170,60%,42%)] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge={t.about.valuesBadge}
            title={t.about.valuesTitle}
            description={t.about.valuesSubtitle}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <ValueCard
                key={value.title}
                icon={value.icon}
                title={value.title}
                description={value.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 lg:py-28 bg-[hsl(220,20%,7%)] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(210,100%,15%)]/30 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-16">
            <span className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-400 bg-teal-400/10 rounded-full mb-4">
              {t.about.impactBadge}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              {t.about.impactTitle}{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">
                {t.about.impactHighlight}
              </span>
            </h2>
            <p className="mt-4 text-lg text-gray-400 dark:text-slate-300 leading-relaxed">
              {t.about.impactSubtitle}
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="text-center p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-teal-400" />
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-400 dark:text-slate-300 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight mb-6">
            {t.about.readyTitle}{' '}
            <span className="gradient-text">{t.about.readyHighlight}</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            {t.about.readySubtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/demo">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[hsl(210,100%,45%)] to-[hsl(210,100%,38%)] hover:from-[hsl(210,100%,40%)] hover:to-[hsl(210,100%,33%)] text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all text-base px-8 h-12"
              >
                {t.about.tryDemoBtn} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/talent">
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 h-12 border-gray-200 hover:bg-gray-50"
              >
                {t.home.browseTalentCta}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
