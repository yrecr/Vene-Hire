'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useData } from '@/lib/data-context';
import { Send, CircleCheck as CheckCircle2, ArrowLeft, Building2, ShieldCheck, Clock, Users, Loader as Loader2, CircleAlert as AlertCircle } from 'lucide-react';

const countries = [
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'Australia',
  'Brazil',
  'Mexico',
  'Colombia',
  'Argentina',
  'Chile',
  'Other',
];

const employerValueProps = [
  {
    icon: ShieldCheck,
    title: 'Manually Reviewed Access',
    description:
      'Every request is reviewed by our team to ensure a quality experience for both companies and candidates.',
  },
  {
    icon: Clock,
    title: 'Response Within 24 Hours',
    description:
      'Our team will reach out to you within one business day to discuss your hiring needs.',
  },
  {
    icon: Users,
    title: 'Pre-Evaluated Talent',
    description:
      'All candidates have been rigorously assessed on technical skills, communication, and collaboration.',
  },
  {
    icon: Building2,
    title: 'Tailored Matching',
    description:
      'We match your requirements with the best-fit engineers from our curated talent pool.',
  },
];

const applicantValueProps = [
  {
    icon: ShieldCheck,
    title: 'Manually Reviewed Access',
    description:
      'Every application is reviewed by our team to keep the talent pool high quality.',
  },
  {
    icon: Clock,
    title: 'Response Within 24 Hours',
    description:
      'Our team will reach out to you within one business day about next steps.',
  },
  {
    icon: Users,
    title: 'Curated Companies',
    description:
      'Once approved, you get a profile in front of vetted companies actively hiring.',
  },
  {
    icon: Building2,
    title: 'Built for International Remote',
    description:
      'Our process is designed to get you ready for remote roles with global teams.',
  },
];

type RequestType = 'employer' | 'applicant';

interface FormData {
  fullName: string;
  company: string;
  email: string;
  country: string;
  hiringNeed: string;
  candidateSlug: string;
  message: string;
}

function RequestDemoForm({ initialType, candidateParam }: { initialType: RequestType; candidateParam: string }) {
  const { setAccessRequests } = useData();

  const [requestType, setRequestType] = useState<RequestType>(initialType);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    company: '',
    email: '',
    country: '',
    hiringNeed: '',
    candidateSlug: candidateParam,
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApplicant = requestType === 'applicant';
  const valueProps = isApplicant ? applicantValueProps : employerValueProps;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const requiredOk = isApplicant
      ? formData.fullName.trim() && formData.email.trim() && formData.country && formData.hiringNeed.trim()
      : formData.fullName.trim() && formData.company.trim() && formData.email.trim() && formData.country && formData.hiringNeed.trim();

    if (!requiredOk) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const entry = {
      id,
      request_type: requestType,
      full_name: formData.fullName,
      company: isApplicant ? '' : formData.company,
      email: formData.email,
      country: formData.country,
      hiring_need: formData.hiringNeed,
      candidate_slug: isApplicant ? null : formData.candidateSlug || null,
      message: formData.message,
      status: 'pending' as const,
      created_at: new Date().toISOString(),
      reviewed_by: null,
    };

    supabase.from('access_requests').insert({
      request_type: entry.request_type, full_name: entry.full_name,
      company: entry.company, email: entry.email, country: entry.country,
      hiring_need: entry.hiring_need, candidate_slug: entry.candidate_slug,
      message: entry.message, status: entry.status, created_at: entry.created_at,
    }).then(() => {}, () => {});

    setAccessRequests((prev) => [entry, ...prev]);

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto text-center py-20">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Request Submitted Successfully
            </h1>
            <p className="text-muted-foreground text-lg mb-2">
              Our team will review your request and reach out within 24 hours.
            </p>
            <p className="text-muted-foreground text-sm mb-10">
              Access is reviewed manually to ensure the best experience for all
              parties.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/">
                <Button
                  variant="outline"
                  className="px-6 h-11 border-gray-200 hover:bg-gray-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <Link href="/talent">
                <Button className="px-6 h-11 bg-gradient-to-r from-[hsl(210,100%,45%)] to-[hsl(210,100%,38%)] hover:from-[hsl(210,100%,40%)] hover:to-[hsl(210,100%,33%)] text-white shadow-lg shadow-blue-500/25">
                  Browse Talent
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-white to-teal-50/40 -z-10" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-100/30 to-teal-100/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="max-w-2xl mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
            {isApplicant ? 'Apply as Talent' : 'Request a Demo'}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {isApplicant
              ? 'Want to join our talent pool? Tell us about yourself below and our team will review your application.'
              : 'To request interviews or gain access to additional candidate details, please submit your request below. Our team will review your request and contact you directly.'}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>
              Access is reviewed manually to ensure quality for all parties.
            </span>
          </div>
        </div>

        {/* Type toggle */}
        <div className="mb-8 inline-flex rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            aria-pressed={requestType === 'employer'}
            onClick={() => setRequestType('employer')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              requestType === 'employer' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            I&apos;m a Company
          </button>
          <button
            type="button"
            aria-pressed={requestType === 'applicant'}
            onClick={() => setRequestType('applicant')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              requestType === 'applicant' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            I&apos;m a Candidate
          </button>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Left column: Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sm:p-8">
              {error && (
                <div className="mb-6 flex items-start gap-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Jane Smith"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Company & Email row */}
                <div className={isApplicant ? '' : 'grid sm:grid-cols-2 gap-6'}>
                  {!isApplicant && (
                    <div className="space-y-2">
                      <Label htmlFor="company">
                        Company Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="company"
                        name="company"
                        type="text"
                        placeholder="Acme Inc."
                        value={formData.company}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {isApplicant ? 'Email' : 'Work Email'} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder={isApplicant ? 'jane@example.com' : 'jane@acme.com'}
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <Label htmlFor="country">
                    Country <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, country: value }))
                    }
                  >
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Hiring Need / Role of Interest */}
                <div className="space-y-2">
                  <Label htmlFor="hiringNeed">
                    {isApplicant ? 'Tech Stack / Role of Interest' : 'Role / Hiring Need'} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="hiringNeed"
                    name="hiringNeed"
                    type="text"
                    placeholder={isApplicant ? 'e.g. React, Node.js, Backend Engineer' : 'e.g. Full-Stack Engineer, React Developer'}
                    value={formData.hiringNeed}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Candidate of Interest — employers only */}
                {!isApplicant && (
                  <div className="space-y-2">
                    <Label htmlFor="candidateSlug">
                      Candidate of Interest{' '}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="candidateSlug"
                      name="candidateSlug"
                      type="text"
                      placeholder="Candidate name or profile link"
                      value={formData.candidateSlug}
                      onChange={handleChange}
                    />
                  </div>
                )}

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">
                    Message{' '}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us more about your team, timeline, or any questions you have..."
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 text-base bg-gradient-to-r from-[hsl(210,100%,45%)] to-[hsl(210,100%,38%)] hover:from-[hsl(210,100%,40%)] hover:to-[hsl(210,100%,33%)] text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Right column: Value propositions */}
          <div className="lg:col-span-2">
            <div className="sticky top-32 space-y-6">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                What to Expect
              </h2>
              <div className="space-y-5">
                {valueProps.map((prop) => (
                  <div
                    key={prop.title}
                    className="flex gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <prop.icon className="w-5 h-5 text-[hsl(210,100%,45%)]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-1">
                        {prop.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {prop.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust badge */}
              <div className="mt-8 p-5 rounded-xl bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-100/60">
                <p className="text-sm text-blue-900 font-medium mb-1">
                  Built for growing teams
                </p>
                <p className="text-xs text-blue-700/80 leading-relaxed">
                  Our talent is pre-trained through real-world agile simulations
                  and rigorous evaluations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RequestDemoFormLoader() {
  const searchParams = useSearchParams();
  const candidateParam = searchParams.get('candidate') || '';
  const typeParam: RequestType = searchParams.get('type') === 'applicant' ? 'applicant' : 'employer';

  // Remount on type change so the toggle reflects a fresh ?type= navigation
  // (e.g. clicking "Apply as Talent" while already on this page).
  return <RequestDemoForm key={typeParam} initialType={typeParam} candidateParam={candidateParam} />;
}

export default function RequestDemoPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-96 bg-gray-100 rounded-2xl mt-8" />
            </div>
          </div>
        </div>
      }
    >
      <RequestDemoFormLoader />
    </Suspense>
  );
}
