'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useData } from '@/lib/data-context';
import { SkillBar } from '@/components/skill-bar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  ArrowLeft, Play, Briefcase, Globe, CircleCheck as CheckCircle2, FileText,
} from 'lucide-react';

function toEmbedUrl(url: string): string {
  if (!url) return url;
  if (url.includes('youtube.com/embed/') || url.includes('player.vimeo.com/video/')) return url;
  const yt = url.match(/(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const ytShort = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}`;
  const vimeo = url.match(/vimeo\.com\/([0-9]+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

const availabilityConfig: Record<string, { label: string; className: string }> = {
  Available: { label: 'Available', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'In Training': { label: 'In Training', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  Hired: { label: 'Hired', className: 'bg-gray-50 text-gray-700 border-gray-200' },
  'On Hold': { label: 'On Hold', className: 'bg-blue-50 text-blue-700 border-blue-200' },
};

export default function AdminApplicantDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { getApplicantById } = useData();
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [resumeCacheBuster, setResumeCacheBuster] = useState(Date.now());

  const talent = getApplicantById(id);

  if (!talent) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Applicant not found</h1>
          <p className="text-gray-500 mb-8">
            The applicant profile you are looking for does not exist or has been removed.
          </p>
          <Link href="/admin/applicants">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Applicants
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
    <div className="pb-12">
      <div className="mb-6">
        <Link href="/admin/applicants">
          <Button variant="ghost" className="gap-2 text-gray-600 hover:text-gray-900 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Applicants
          </Button>
        </Link>
      </div>

      <section className="bg-gray-50 border border-gray-100 rounded-2xl">
        <div className="px-6 py-10 md:px-10 md:py-12">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            <div className="shrink-0">
              <div className="relative">
                <img
                  src={talent.profile_image_url ?? ''}
                  alt={talent.display_name}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover shadow-lg ring-4 ring-white"
                />
                {talent.availability_status === 'Available' && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {talent.display_name}
              </h1>
              <p className="text-sm text-gray-400 mb-2">{talent.slug}</p>
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
                <Badge variant="outline" className="bg-white text-gray-700 border-gray-200 px-3 py-1 text-sm font-medium">
                  {talent.public_visible ? 'Visible' : 'Hidden'}
                </Badge>
                {talent.featured && (
                  <Badge variant="outline" className="bg-white text-gray-700 border-gray-200 px-3 py-1 text-sm font-medium">
                    Featured
                  </Badge>
                )}
              </div>

              <p className="text-gray-600 leading-relaxed text-base mb-6">{talent.summary}</p>

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

      <div className="mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-600 leading-relaxed">{talent.bio}</p>
            </div>

            {talent.resume_url && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Resume</h2>
                <button
                  onClick={() => { setResumeCacheBuster(Date.now()); setResumeModalOpen(true); }}
                  className="inline-flex items-center gap-2 text-[hsl(210,100%,45%)] hover:underline"
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-base font-medium">View Resume</span>
                </button>
              </div>
            )}

            <Dialog open={resumeModalOpen} onOpenChange={setResumeModalOpen}>
              <DialogContent className="max-w-4xl h-[80vh]">
                <DialogTitle className="sr-only">Resume</DialogTitle>
                <iframe
                  src={`${talent.resume_url ?? ''}?t=${resumeCacheBuster}`}
                  className="w-full h-full border-0 rounded-lg"
                  title="Resume"
                />
              </DialogContent>
            </Dialog>

            {talent.video_url && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <div className="flex items-center gap-2 mb-5">
                  <Play className="w-5 h-5 text-gray-700" />
                  <h2 className="text-xl font-semibold text-gray-900">Introduction Video</h2>
                </div>
                <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: '16 / 9' }}>
                  <iframe
                    src={toEmbedUrl(talent.video_url)}
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
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 sticky top-6">
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
    </div>
  );
}
