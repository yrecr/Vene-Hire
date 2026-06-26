'use client';

import { useState } from 'react';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth';
import { InterviewRequestModal } from '@/components/interview-request-modal';
import { SkillBar } from '@/components/skill-bar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Clock, MapPin, Calendar, Briefcase, ArrowRight, Globe, CircleCheck as CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const availabilityConfig: Record<string, { label: string; className: string }> = {
  Available: { label: 'Available', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'In Training': { label: 'In Training', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  Hired: { label: 'Hired', className: 'bg-gray-50 text-gray-700 border-gray-200' },
  'On Hold': { label: 'On Hold', className: 'bg-blue-50 text-blue-700 border-blue-200' },
};

export default function TalentProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  const { currentUser } = useAuth();
  const { getEmployerById, talentProfiles } = useData();
  const [modalOpen, setModalOpen] = useState(false);

  const talent = talentProfiles.find((t) => t.slug === slug);

  const isEmployer = currentUser?.role === 'employer';
  const employerId = isEmployer && currentUser?.employer_profile_id
    ? (getEmployerById(currentUser.employer_profile_id)?.id || 'ep-acme')
    : null;
  const backLink = isEmployer ? '/employer/applicants' : '/talent';

  if (!talent) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Talent not found</h1>
          <p className="text-gray-500 mb-8">
            The talent profile you are looking for does not exist or has been removed.
          </p>
          <Link href={backLink}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Talent
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const availability = availabilityConfig[talent.availability_status] ?? {
    label: talent.availability_status,
    className: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <Link href={backLink}>
          <Button variant="ghost" className="gap-2 text-gray-600 hover:text-gray-900 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Talent
          </Button>
        </Link>
      </div>

      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            <div className="shrink-0">
              <div className="relative">
                <img
                  src={talent.profile_image_url ?? ''}
                  alt={talent.display_name}
                  className="w-40 h-40 md:w-52 md:h-52 rounded-2xl object-cover shadow-lg ring-4 ring-white"
                />
                {talent.availability_status === 'Available' && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {talent.display_name}
              </h1>
              <p className="text-lg text-gray-600 mb-5">{talent.title}</p>

              <div className="flex flex-wrap gap-3 mb-6">
                <Badge variant="outline" className={`${availability.className} px-3 py-1 text-sm font-medium`}>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  {availability.label}
                </Badge>
                <Badge variant="outline" className="bg-white text-gray-700 border-gray-200 px-3 py-1 text-sm font-medium">
                  <Globe className="w-3.5 h-3.5 mr-1.5" />
                  {talent.english_level} English
                </Badge>
                <Badge variant="outline" className="bg-white text-gray-700 border-gray-200 px-3 py-1 text-sm font-medium">
                  <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                  {talent.years_experience} years experience
                </Badge>
              </div>

              <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-6">{talent.summary}</p>

              <div className="flex flex-wrap gap-2">
                {talent.tech_stack.map((tech) => (
                  <Badge key={tech} variant="secondary" className="bg-white shadow-sm border border-gray-200 text-gray-700 px-3 py-1 text-sm">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-600 leading-relaxed">{talent.bio}</p>
            </div>

            {talent.video_url && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <div className="flex items-center gap-2 mb-5">
                  <Play className="w-5 h-5 text-gray-700" />
                  <h2 className="text-xl font-semibold text-gray-900">Introduction Video</h2>
                </div>
                <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: '16 / 9' }}>
                  <iframe
                    src={talent.video_url}
                    title={`${talent.display_name} introduction video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 sticky top-28">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Skills</h2>
              <div className="space-y-5">
                {talent.skills?.map((skill) => (
                  <SkillBar key={skill.id} name={skill.skill_name} score={skill.score} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-center shadow-xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Interested in {talent.display_name}?
          </h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Get in touch to learn more about this candidate or explore our full talent pool for your hiring needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isEmployer && employerId ? (
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 gap-2 w-full sm:w-auto"
                onClick={() => setModalOpen(true)}
              >
                Request Interview
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Link href={`/request-sign-up?candidate=${talent.slug}`}>
                <Button
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-gray-100 gap-2 w-full sm:w-auto"
                >
                  Request Interview
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
            <Link href="/request-sign-up">
              <Button
                size="lg"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white gap-2 w-full sm:w-auto"
              >
                Request a Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {isEmployer && employerId && (
        <InterviewRequestModal
          applicant={talent}
          employerId={employerId}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </div>
  );
}
