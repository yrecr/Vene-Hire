'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Save, FileText, Video, Upload, Camera, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { SkillBar } from '@/components/skill-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { useData } from '@/lib/data-context';
import type { TalentProfile, TalentSkill } from '@/types';

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

const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Bogota',
  'America/Caracas',
  'America/Lima',
  'America/Santiago',
  'America/Buenos_Aires',
  'America/Mexico_City',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Madrid',
  'UTC',
];

const englishLevels = ['Basic', 'Intermediate', 'Advanced', 'Fluent', 'Native'];
const availabilityStatuses = ['Available', 'Hired', 'In Training', 'On Hold'];

export default function ApplicantProfilePage() {
  const { currentUser } = useAuth();
  const { talentProfiles, updateTalentProfile } = useData();
  const user = currentUser;

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

  const [displayName, setDisplayName] = useState(talentProfile?.display_name || '');
  const [title, setTitle] = useState(talentProfile?.title || '');
  const [summary, setSummary] = useState(talentProfile?.summary || '');
  const [bio, setBio] = useState(talentProfile?.bio || '');
  const [techStack, setTechStack] = useState(
    talentProfile?.tech_stack ? talentProfile.tech_stack.join(', ') : ''
  );
  const [englishLevel, setEnglishLevel] = useState<string>(talentProfile?.english_level || 'Intermediate');
  const [yearsExperience, setYearsExperience] = useState(
    talentProfile?.years_experience?.toString() || '0'
  );
  const [timezone, setTimezone] = useState(talentProfile?.timezone || 'America/Bogota');
  const [availabilityStatus, setAvailabilityStatus] = useState<string>(
    talentProfile?.availability_status || 'Available'
  );
  const [saved, setSaved] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [resumeCacheBuster, setResumeCacheBuster] = useState(Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');
  const [analysisTriggered, setAnalysisTriggered] = useState(false);

  useEffect(function () {
    if (!talentProfile) return;
    setDisplayName(talentProfile.display_name || '');
    setTitle(talentProfile.title || '');
    setSummary(talentProfile.summary || '');
    setBio(talentProfile.bio || '');
    setTechStack(talentProfile.tech_stack ? talentProfile.tech_stack.join(', ') : '');
    setEnglishLevel(talentProfile.english_level || 'Intermediate');
    setYearsExperience(talentProfile.years_experience?.toString() || '0');
    setTimezone(talentProfile.timezone || 'America/Bogota');
    setAvailabilityStatus(talentProfile.availability_status || 'Available');
  }, [talentProfile]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Please sign in</h2>
          <p className="text-muted-foreground">Sign in with an applicant account to edit your profile.</p>
        </div>
      </div>
    );
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !talentProfile) return;
    setPhotoUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/photo/upload', { method: 'POST', body: formData });
    if (res.ok) {
      const { url } = await res.json();
      updateTalentProfile({ ...talentProfile, profile_image_url: url });
    }
    setPhotoUploading(false);
  }

  async function handleAnalyzeResume() {
    if (!talentProfile?.resume_url) return;
    setAnalyzing(true);
    setAnalyzeError('');
    setAnalysisTriggered(false);
    try {
      const r = await fetch('/api/resume/analyze', { method: 'POST' });
      if (r.ok) {
        setAnalysisTriggered(true);
      } else {
        const data = await r.json();
        setAnalyzeError(data.detail || data.error || 'Analysis failed');
      }
    } catch {
      setAnalyzeError('Network error');
    }
    setAnalyzing(false);
  }

  function handleSave() {
    if (!talentProfile) return;
    updateTalentProfile({
      ...talentProfile,
      display_name: displayName,
      title,
      summary,
      bio,
      tech_stack: techStack.split(',').map((s) => s.trim()).filter(Boolean),
      english_level: englishLevel as TalentProfile['english_level'],
      years_experience: parseInt(yearsExperience) || 0,
      timezone,
      availability_status: availabilityStatus as TalentProfile['availability_status'],
    });
    setSaved(true);
    setTimeout(function () { setSaved(false); }, 3000);
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">My Profile</h2>
        <p className="text-muted-foreground mt-1">
          Update your profile information to help employers find you.
        </p>
      </div>

      {/* Save feedback */}
      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">
          Profile saved successfully!
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
        {/* Profile Image */}
        {talentProfile && (
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
              {talentProfile.profile_image_url ? (
                <img
                  src={talentProfile.profile_image_url}
                  alt={talentProfile.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Camera className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Profile Photo</p>
              <p className="text-xs text-muted-foreground">
                {talentProfile.profile_image_url ? 'Photo uploaded' : 'No photo uploaded'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={photoUploading}
            >
              {photoUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {photoUploading ? 'Uploading...' : 'Update Photo'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={function (e) { setDisplayName(e.target.value); }}
              placeholder="Your display name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={function (e) { setTitle(e.target.value); }}
              placeholder="e.g. Backend Engineer"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary">Summary</Label>
          <Textarea
            id="summary"
            value={summary}
            onChange={function (e) { setSummary(e.target.value); }}
            placeholder="A brief summary of your experience and expertise..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={function (e) { setBio(e.target.value); }}
            placeholder="Tell employers more about your background..."
            rows={5}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="techStack">Technologies (comma-separated)</Label>
          <Input
            id="techStack"
            value={techStack}
            onChange={function (e) { setTechStack(e.target.value); }}
            placeholder="Python, Node.js, PostgreSQL, AWS..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>English Level</Label>
            <Select value={englishLevel} onValueChange={setEnglishLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {englishLevels.map(function (level) {
                  return (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="yearsExperience">Years of Experience</Label>
            <Input
              id="yearsExperience"
              type="number"
              min="0"
              max="30"
              value={yearsExperience}
              onChange={function (e) { setYearsExperience(e.target.value); }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Location / Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map(function (tz) {
                  return (
                    <SelectItem key={tz} value={tz}>
                      {tz.replace(/_/g, ' ')}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Availability Status</Label>
            <Select value={availabilityStatus} onValueChange={setAvailabilityStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {availabilityStatuses.map(function (status) {
                  return (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-2">
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Save Profile
          </Button>
        </div>
      </div>

      {/* Skills */}
      {talentProfile?.skills && talentProfile.skills.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-foreground mb-5">Skills</h3>
          <div className="space-y-4">
            {talentProfile.skills.map(function (skill) {
              return (
                <SkillBar key={skill.id} name={skill.skill_name} score={skill.score} />
              );
            })}
          </div>
        </div>
      )}

      {/* Resume & Video */}
      {talentProfile && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
          <h3 className="text-base font-semibold text-foreground">Multimedia</h3>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Resume</p>
            {talentProfile.resume_url ? (
              <button
                onClick={() => { setResumeCacheBuster(Date.now()); setResumeModalOpen(true); }}
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <FileText className="w-4 h-4" />
                View Resume
              </button>
            ) : (
              <p className="text-sm text-muted-foreground">No resume uploaded.</p>
            )}
            {talentProfile.resume_url && (
              <div className="mt-3 space-y-2">
                {analysisTriggered ? (
                  <p className="text-xs text-emerald-600">Analysis started — results will appear shortly. Refresh to see updated skills.</p>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={handleAnalyzeResume}
                    disabled={analyzing}
                  >
                    {analyzing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {analyzing ? 'Starting...' : 'Analyze CV with AI'}
                  </Button>
                )}
                {analyzeError && (
                  <p className="text-xs text-red-600">{analyzeError}</p>
                )}
              </div>
            )}
          </div>

          <Dialog open={resumeModalOpen} onOpenChange={setResumeModalOpen}>
            <DialogContent className="max-w-4xl h-[80vh]">
              <DialogTitle className="sr-only">Resume</DialogTitle>
              <iframe
                src={`${talentProfile.resume_url ?? ''}?t=${resumeCacheBuster}`}
                className="w-full h-full border-0 rounded-lg"
                title="Resume"
              />
            </DialogContent>
          </Dialog>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Presentation Video</p>
            {talentProfile.video_url ? (
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 max-w-lg">
                <iframe
                  src={toEmbedUrl(talentProfile.video_url)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Presentation video"
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No video uploaded.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
