'use client';

import { useMemo } from 'react';
import { FileText, Upload, File, CircleCheck as CheckCircle2, RefreshCw } from 'lucide-react';
import { useDemoAuth } from '@/lib/demo-auth';
import { Button } from '@/components/ui/button';
import { useMockData } from '@/lib/data-context';

export default function ApplicantResumePage() {
  const { currentUser } = useDemoAuth();
  const { talentProfiles } = useMockData();
  const user = currentUser;

  const talentProfile = useMemo(function () {
    if (!user?.talent_profile_id) return null;
    return talentProfiles.find(function (t) { return t.id === user.talent_profile_id; }) || null;
  }, [user, talentProfiles]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Please sign in</h2>
          <p className="text-muted-foreground">Sign in with an applicant account to manage your resume.</p>
        </div>
      </div>
    );
  }

  const hasResume = !!talentProfile?.resume_url;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">My Resume</h2>
        <p className="text-muted-foreground mt-1">
          Upload your resume so employers can review your experience.
        </p>
      </div>

      {/* Current resume status */}
      {hasResume && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-semibold text-foreground">Resume Uploaded</h3>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center">
              <File className="w-6 h-6 text-[hsl(210,100%,45%)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {talentProfile?.display_name?.toLowerCase().replace(/\s+/g, '-')}-resume.pdf
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground">PDF Document</span>
                <span className="text-xs text-muted-foreground">245 KB</span>
                <span className="text-xs text-muted-foreground">
                  Uploaded {new Date(talentProfile?.created_at || '').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Replace Resume
            </Button>
          </div>
        </div>
      )}

      {/* Upload area */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">
          {hasResume ? 'Upload a New Resume' : 'Upload Your Resume'}
        </h3>
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center hover:border-[hsl(210,100%,45%)]/40 transition-colors cursor-pointer">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-7 h-7 text-[hsl(210,100%,45%)]" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            Drop your resume here or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Supports PDF, DOC, DOCX (max 10MB)
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-foreground mb-3">Resume Tips</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-[hsl(210,100%,45%)] mt-0.5 shrink-0" />
            <span className="text-sm text-muted-foreground">Keep it concise, ideally 1-2 pages.</span>
          </li>
          <li className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-[hsl(210,100%,45%)] mt-0.5 shrink-0" />
            <span className="text-sm text-muted-foreground">Highlight relevant technical skills and projects.</span>
          </li>
          <li className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-[hsl(210,100%,45%)] mt-0.5 shrink-0" />
            <span className="text-sm text-muted-foreground">Include measurable achievements and impact metrics.</span>
          </li>
          <li className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-[hsl(210,100%,45%)] mt-0.5 shrink-0" />
            <span className="text-sm text-muted-foreground">Use PDF format for best compatibility.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
