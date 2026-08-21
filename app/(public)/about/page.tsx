import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/section-header';
import { ValueCard } from '@/components/value-card';
import { ArrowRight, Lightbulb, Award, Shield, Rocket, Building2, GraduationCap, Users, TrendingUp, CircleCheck as CheckCircle2, Target, ChartBar as BarChart3 } from 'lucide-react';

const values = [
  {
    icon: Lightbulb,
    title: 'Innovation',
    description:
      'We continuously evolve our training methodology and platform to stay ahead of industry demands and emerging technologies.',
  },
  {
    icon: Award,
    title: 'Excellence',
    description:
      'Every engineer in our program is held to the highest standards of code quality, communication, and professional conduct.',
  },
  {
    icon: Shield,
    title: 'Integrity',
    description:
      'We believe in transparent evaluations, honest skill assessments, and building trust with both engineers and hiring companies.',
  },
  {
    icon: Rocket,
    title: 'Impact',
    description:
      'Our goal is measurable outcomes -- engineers who contribute from day one and companies that scale faster with less risk.',
  },
];

const stats = [
  { value: 'Curated', label: 'Talent Pool', icon: Users },
  { value: 'Direct', label: 'Employer Access', icon: Building2 },
  { value: 'Rigorous', label: 'Evaluation Process', icon: TrendingUp },
  { value: 'Ongoing', label: 'Cohorts', icon: GraduationCap },
];

const forCompanies = [
  'Browse our curated pool of pre-evaluated engineers',
  'Review detailed technical profiles and intro videos',
  'Request interviews with candidates that match your needs',
  'Onboard production-ready talent with guided support',
];

const forEngineers = [
  'Apply and complete a technical screening assessment',
  'Join an intensive cohort with real-world project simulations',
  'Receive mentorship, code reviews, and soft-skill training',
  'Get matched with top companies looking for your skill set',
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-24 pb-20 lg:pt-36 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-teal-50/50 -z-10" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/40 to-teal-100/30 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-teal-100/30 to-blue-100/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(210,100%,45%)] bg-[hsl(210,100%,45%)]/10 rounded-full mb-6">
            About Us
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1] max-w-4xl mx-auto">
            About{' '}
            <span className="gradient-text">VeneHire</span>
          </h1>
          <p className="mt-6 text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            We are on a mission to bridge the gap between exceptional talent and
            the companies that need them -- creating opportunities that
            transform careers and accelerate business growth.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <SectionHeader
                badge="Our Mission"
                title="Preparing the Next Generation of Production-Ready Engineers"
                align="left"
              />
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  At VeneHire, we believe that raw talent is everywhere but
                  opportunity is not. Traditional hiring pipelines are slow,
                  expensive, and often fail to identify engineers who can truly
                  deliver from day one.
                </p>
                <p>
                  Our intensive accelerator program transforms promising
                  engineers into production-ready professionals through
                  real-world project simulations, agile team workflows, peer
                  code reviews, and mentorship from industry veterans.
                </p>
                <p>
                  The result is a curated talent pool that companies can trust --
                  engineers who have already proven they can ship quality code,
                  collaborate effectively, and adapt to fast-paced product
                  environments.
                </p>
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
      <section className="py-20 lg:py-28 bg-gray-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="How It Works"
            title="A Simple Process for Everyone"
            description="Whether you are a company looking for top talent or an engineer looking for your next opportunity, we have streamlined the experience."
          />
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* For Companies */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center mb-6">
                <Building2 className="w-7 h-7 text-[hsl(210,100%,45%)]" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                For Companies
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Hire pre-evaluated, job-ready engineers and reduce your
                time-to-fill by weeks.
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
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center mb-6">
                <GraduationCap className="w-7 h-7 text-[hsl(210,100%,45%)]" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                For Engineers
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Level up your skills and get matched with companies that value
                your expertise.
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
            badge="Our Values"
            title="What Drives Us Every Day"
            description="These core values guide every decision we make, from how we train engineers to how we partner with companies."
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
              Our Impact
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Numbers That Speak for{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">
                Themselves
              </span>
            </h2>
            <p className="mt-4 text-lg text-gray-400 leading-relaxed">
              We measure our success by the outcomes we create for engineers and
              companies alike.
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
                <p className="text-sm text-gray-400 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight mb-6">
            Ready to See VeneHire{' '}
            <span className="gradient-text">in Action?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Schedule a personalized demo to see how our platform can help you
            hire production-ready engineers faster and with less risk.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/request-sign-up">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[hsl(210,100%,45%)] to-[hsl(210,100%,38%)] hover:from-[hsl(210,100%,40%)] hover:to-[hsl(210,100%,33%)] text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all text-base px-8 h-12"
              >
                Request a Demo <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/talent">
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 h-12 border-gray-200 hover:bg-gray-50"
              >
                Browse Talent
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
