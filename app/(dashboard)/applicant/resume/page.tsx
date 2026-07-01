'use client';

import { useState, useMemo, useRef } from 'react';
import { FileText, Upload, File, CircleCheck as CheckCircle2, Loader2, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { useData } from '@/lib/data-context';

export default function ApplicantResumePage() {
  const { currentUser } = useAuth();
  const { talentProfiles, updateTalentProfile } = useData();
  const user = currentUser;
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [resumeCacheBuster, setResumeCacheBuster] = useState(Date.now());

  const talentProfile = useMemo(function () {
    if (user?.talent_profile_id) {
      const found = talentProfiles.find(function (t) { return t.id === user.talent_profile_id; });
      if (found) return found;
    }
    if (user?.profile_id) {
      const found = talentProfiles.find(function (t) { return t.user_id === user.profile_id; });
      if (found) return found;
    }
    return null;
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

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !talentProfile) return;
    setUploadError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/resume/upload', { method: 'POST', body: formData });
    const result = await res.json();

    if (result.url) {
      updateTalentProfile({ ...talentProfile, resume_url: result.url });
    } else {
      setUploadError('Upload failed: ' + (result.error || 'unknown error'));
    }
    e.target.value = '';
    setUploading(false);
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">My Resume</h2>
        <p className="text-muted-foreground mt-1">
          Upload your resume so employers can review your experience.
        </p>
      </div>

      {/* Upload error */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {uploadError}
        </div>
      )}

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
              <a
                href={talentProfile!.resume_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-foreground truncate hover:text-[hsl(210,100%,45%)] flex items-center gap-1"
              >
                {talentProfile?.display_name?.toLowerCase().replace(/\s+/g, '-')}-resume.pdf
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground">PDF Document</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => { setResumeCacheBuster(Date.now()); setResumeModalOpen(true); }}
            >
              <ExternalLink className="w-4 h-4" />
              View Resume
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={uploading}
              onClick={function () { inputRef.current?.click(); }}
            >
              <Upload className="w-4 h-4" />
              Replace
            </Button>
          </div>
        </div>
      )}

      <Dialog open={resumeModalOpen} onOpenChange={setResumeModalOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogTitle className="sr-only">Resume</DialogTitle>
          <iframe
            src={`${talentProfile?.resume_url ?? ''}?t=${resumeCacheBuster}`}
            className="w-full h-full border-0 rounded-lg"
            title="Resume"
          />
        </DialogContent>
      </Dialog>

      {/* Upload area */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">
          {hasResume ? 'Upload a New Resume' : 'Upload Your Resume'}
        </h3>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={handleFileUpload}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={function () { inputRef.current?.click(); }}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl p-10 text-center hover:border-[hsl(210,100%,45%)]/40 transition-colors cursor-pointer disabled:opacity-50"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center mx-auto mb-4">
            {uploading ? (
              <Loader2 className="w-7 h-7 text-[hsl(210,100%,45%)] animate-spin" />
            ) : (
              <Upload className="w-7 h-7 text-[hsl(210,100%,45%)]" />
            )}
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            {uploading ? 'Uploading...' : 'Drop your resume here or click to browse'}
          </p>
          <p className="text-xs text-muted-foreground">
            Supports PDF, DOC, DOCX (max 10MB)
          </p>
        </button>
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
