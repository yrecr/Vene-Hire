'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Save, FileText, Video, Upload, Camera, Loader2, Sparkles,
  File, CircleCheck as CheckCircle2, ExternalLink, Link2, Clock, Plus, Trash2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { demoGuard } from '@/lib/demo';
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
import type { AvailabilitySlot, TalentProfile } from '@/types';
import { useT } from '@/lib/i18n';

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

const dayNamesEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const dayNamesEs = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const generalAvailabilityOptions = [
  'Available Immediately',
  'In 2 Weeks',
  'In 1 Month',
  'Not Available',
];

const timeSlots = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00',
];

export function ApplicantProfileSettings() {
  const { t, lang } = useT();
  const isEs = lang === 'es';
  const dayNames = isEs ? dayNamesEs : dayNamesEn;
  const { currentUser } = useAuth();
  const {
    talentProfiles,
    updateTalentProfile,
    getAvailabilityForApplicant,
    updateAvailabilitySlots,
  } = useData();
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

  // ---- Basic Info state (from applicant/profile) ----
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

  // ---- Resume state (from applicant/resume) ----
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeUploadError, setResumeUploadError] = useState('');

  // ---- Video state (from applicant/video) ----
  const [videoUrl, setVideoUrl] = useState(talentProfile?.video_url || '');
  const [videoSaved, setVideoSaved] = useState(false);
  const [videoSaving, setVideoSaving] = useState(false);
  const [videoSaveError, setVideoSaveError] = useState<string | null>(null);

  useEffect(function () {
    if (!talentProfile) return;
    setVideoUrl(talentProfile.video_url || '');
  }, [talentProfile]);

  // ---- Availability state (from applicant/availability) ----
  const initialSlots = useMemo(function () {
    if (!talentProfile) return [];
    return getAvailabilityForApplicant(talentProfile.id);
  }, [talentProfile, getAvailabilityForApplicant]);

  function generalAvailFromStatus(status: string): string {
    return status === 'Available' ? 'Available Immediately' : 'Not Available';
  }

  function statusFromGeneralAvail(ga: string): string {
    return ga === 'Not Available' ? 'On Hold' : 'Available';
  }

  const [availTimezone, setAvailTimezone] = useState(talentProfile?.timezone || 'America/Bogota');
  const [generalAvailability, setGeneralAvailability] = useState(
    generalAvailFromStatus(talentProfile?.availability_status || '')
  );
  const [slots, setSlots] = useState<AvailabilitySlot[]>(initialSlots);
  useEffect(() => { setSlots(initialSlots); }, [initialSlots]);
  useEffect(function () {
    if (!talentProfile) return;
    setAvailTimezone(talentProfile.timezone || 'America/Bogota');
    setGeneralAvailability(generalAvailFromStatus(talentProfile.availability_status));
  }, [talentProfile]);
  const [newDay, setNewDay] = useState('1');
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('12:00');
  const [availSaved, setAvailSaved] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">{isEs ? 'Por favor inicia sesión' : 'Please sign in'}</h2>
          <p className="text-muted-foreground">{t.applicant.signInPrompt}</p>
        </div>
      </div>
    );
  }

  // ---- Basic Info handlers ----
  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !talentProfile) return;
    if (demoGuard('Upload photo')) return;
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
    if (demoGuard('Analyze resume')) return;
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

  function handleSaveProfile() {
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

  // ---- Resume handlers ----
  const hasResume = !!talentProfile?.resume_url;

  async function handleResumeFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !talentProfile) return;
    if (demoGuard('Upload resume')) return;
    setResumeUploadError('');
    setResumeUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/resume/upload', { method: 'POST', body: formData });
    const result = await res.json();

    if (result.url) {
      updateTalentProfile({ ...talentProfile, resume_url: result.url });
    } else {
      setResumeUploadError('Upload failed: ' + (result.error || 'unknown error'));
    }
    e.target.value = '';
    setResumeUploading(false);
  }

  // ---- Video handlers ----
  async function handleSaveVideo() {
    if (!talentProfile) return;
    setVideoSaving(true);
    setVideoSaveError(null);
    try {
      await updateTalentProfile({ ...talentProfile, video_url: videoUrl || '' });
      setVideoSaved(true);
      setTimeout(function () { setVideoSaved(false); }, 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar el video. Intenta de nuevo.';
      setVideoSaveError(message);
    } finally {
      setVideoSaving(false);
    }
  }

  const hasVideo = !!talentProfile?.video_url;

  // ---- Availability handlers ----
  function handleAddSlot() {
    var newSlot: AvailabilitySlot = {
      id: crypto.randomUUID(),
      applicant_id: talentProfile?.id || '',
      day_of_week: parseInt(newDay, 10) % 7,
      start_time: newStart,
      end_time: newEnd,
      timezone: availTimezone,
    };
    setSlots(function (prev) { return prev.concat([newSlot]); });
  }

  function handleDeleteSlot(slotId: string) {
    setSlots(function (prev) { return prev.filter(function (s) { return s.id !== slotId; }); });
  }

  function handleSaveAvailability() {
    if (!talentProfile) return;
    updateAvailabilitySlots(talentProfile.id, slots);
    updateTalentProfile({
      ...talentProfile,
      timezone: availTimezone,
      availability_status: statusFromGeneralAvail(generalAvailability) as TalentProfile['availability_status'],
    });
    setAvailSaved(true);
    setTimeout(function () { setAvailSaved(false); }, 3000);
  }

  return (
    <div className="space-y-10 max-w-3xl">

      {/* ===================== Basic Info ===================== */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{isEs ? 'Información Básica' : 'Basic Info'}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isEs ? 'Actualiza los datos de tu perfil para que los empleadores puedan encontrarte.' : 'Update your profile information to help employers find you.'}
          </p>
        </div>

        {saved && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">
            {isEs ? '¡Perfil guardado con éxito!' : 'Profile saved successfully!'}
          </div>
        )}

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
                <p className="text-sm font-medium text-foreground">{isEs ? 'Foto de Perfil' : 'Profile Photo'}</p>
                <p className="text-xs text-muted-foreground">
                  {talentProfile.profile_image_url ? (isEs ? 'Foto subida' : 'Photo uploaded') : (isEs ? 'Sin foto subida' : 'No photo uploaded')}
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
                {photoUploading ? (isEs ? 'Subiendo...' : 'Uploading...') : (isEs ? 'Actualizar Foto' : 'Update Photo')}
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
              <Label htmlFor="displayName">{isEs ? 'Nombre Público' : 'Display Name'}</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={function (e) { setDisplayName(e.target.value); }}
                placeholder={isEs ? 'Tu nombre para mostrar' : 'Your display name'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">{isEs ? 'Título Profesional' : 'Title'}</Label>
              <Input
                id="title"
                value={title}
                onChange={function (e) { setTitle(e.target.value); }}
                placeholder={isEs ? 'ej. Ingeniero Backend' : 'e.g. Backend Engineer'}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">{isEs ? 'Resumen' : 'Summary'}</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={function (e) { setSummary(e.target.value); }}
              placeholder={isEs ? 'Un breve resumen de tu experiencia y especialidad...' : 'A brief summary of your experience and expertise...'}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">{isEs ? 'Biografía' : 'Bio'}</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={function (e) { setBio(e.target.value); }}
              placeholder={isEs ? 'Cuéntale a los empleadores más sobre tu trayectoria...' : 'Tell employers more about your background...'}
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="techStack">{isEs ? 'Tecnologías (separadas por coma)' : 'Technologies (comma-separated)'}</Label>
            <Input
              id="techStack"
              value={techStack}
              onChange={function (e) { setTechStack(e.target.value); }}
              placeholder="Python, Node.js, PostgreSQL, AWS..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>{isEs ? 'Nivel de Inglés' : 'English Level'}</Label>
              <Select value={englishLevel} onValueChange={setEnglishLevel}>
                <SelectTrigger>
                  <SelectValue placeholder={isEs ? 'Seleccionar nivel' : 'Select level'} />
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
              <Label htmlFor="yearsExperience">{isEs ? 'Años de Experiencia' : 'Years of Experience'}</Label>
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
              <Label>{isEs ? 'Ubicación / Zona Horaria' : 'Location / Timezone'}</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue placeholder={isEs ? 'Seleccionar zona horaria' : 'Select timezone'} />
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
              <Label>{isEs ? 'Estado de Disponibilidad' : 'Availability Status'}</Label>
              <Select value={availabilityStatus} onValueChange={setAvailabilityStatus}>
                <SelectTrigger>
                  <SelectValue placeholder={isEs ? 'Seleccionar estado' : 'Select status'} />
                </SelectTrigger>
                <SelectContent>
                  {availabilityStatuses.map(function (status) {
                    return (
                      <SelectItem key={status} value={status}>
                        {(t.badges as Record<string, string>)[status.toLowerCase().replace(/\s+/g, '_')] || status}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-2">
            <Button onClick={handleSaveProfile} className="gap-2">
              <Save className="w-4 h-4" />
              {isEs ? 'Guardar Perfil' : 'Save Profile'}
            </Button>
          </div>
        </div>

        {/* Skills */}
        {talentProfile?.skills && talentProfile.skills.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-base font-semibold text-foreground mb-5">{isEs ? 'Habilidades' : 'Skills'}</h3>
            <div className="space-y-4">
              {talentProfile.skills.map(function (skill) {
                return (
                  <SkillBar key={skill.id} name={skill.skill_name} score={skill.score} />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ===================== Resume ===================== */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{isEs ? 'Currículum (CV)' : 'Resume'}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isEs ? 'Sube tu CV para que los empleadores puedan revisar tu experiencia.' : 'Upload your resume so employers can review your experience.'}
          </p>
        </div>

        {resumeUploadError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {resumeUploadError}
          </div>
        )}

        {hasResume && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-semibold text-foreground">{isEs ? 'CV Subido' : 'Resume Uploaded'}</h3>
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
                  <span className="text-xs text-muted-foreground">{isEs ? 'Documento PDF' : 'PDF Document'}</span>
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
                {isEs ? 'Ver CV' : 'View Resume'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={resumeUploading}
                onClick={function () { resumeInputRef.current?.click(); }}
              >
                <Upload className="w-4 h-4" />
                {isEs ? 'Reemplazar' : 'Replace'}
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              {analysisTriggered ? (
                <p className="text-xs text-emerald-600">{isEs ? 'Análisis iniciado — los resultados aparecerán pronto. Actualiza para ver habilidades.' : 'Analysis started — results will appear shortly. Refresh to see updated skills.'}</p>
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
                  {analyzing ? (isEs ? 'Iniciando...' : 'Starting...') : (isEs ? 'Analizar CV con IA' : 'Analyze CV with AI')}
                </Button>
              )}
              {analyzeError && (
                <p className="text-xs text-red-600">{analyzeError}</p>
              )}
            </div>
          </div>
        )}

        <Dialog open={resumeModalOpen} onOpenChange={setResumeModalOpen}>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogTitle className="sr-only">{isEs ? 'Currículum' : 'Resume'}</DialogTitle>
            <iframe
              src={`${talentProfile?.resume_url ?? ''}?t=${resumeCacheBuster}`}
              className="w-full h-full border-0 rounded-lg"
              title={t.applicant.resume}
            />
          </DialogContent>
        </Dialog>

        {/* Upload area */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">
            {hasResume ? (isEs ? 'Subir un Nuevo CV' : 'Upload a New Resume') : (isEs ? 'Sube tu CV' : 'Upload Your Resume')}
          </h3>
          <input
            ref={resumeInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={handleResumeFileUpload}
          />
          <button
            type="button"
            disabled={resumeUploading}
            onClick={function () { resumeInputRef.current?.click(); }}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl p-10 text-center hover:border-[hsl(210,100%,45%)]/40 transition-colors cursor-pointer disabled:opacity-50"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center mx-auto mb-4">
              {resumeUploading ? (
                <Loader2 className="w-7 h-7 text-[hsl(210,100%,45%)] animate-spin" />
              ) : (
                <Upload className="w-7 h-7 text-[hsl(210,100%,45%)]" />
              )}
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              {resumeUploading ? (isEs ? 'Subiendo...' : 'Uploading...') : (isEs ? 'Arrastra tu CV aquí o haz clic para explorar' : 'Drop your resume here or click to browse')}
            </p>
            <p className="text-xs text-muted-foreground">
              {isEs ? 'Formatos soportados: PDF, DOC, DOCX (máx 10MB)' : 'Supports PDF, DOC, DOCX (max 10MB)'}
            </p>
          </button>
        </div>

        {/* Tips */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-foreground mb-3">{isEs ? 'Consejos para el CV' : 'Resume Tips'}</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-[hsl(210,100%,45%)] mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{isEs ? 'Mantenlo conciso, preferiblemente de 1 a 2 páginas.' : 'Keep it concise, ideally 1-2 pages.'}</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-[hsl(210,100%,45%)] mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{isEs ? 'Destaca proyectos y habilidades técnicas clave.' : 'Highlight relevant technical skills and projects.'}</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-[hsl(210,100%,45%)] mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{isEs ? 'Incluye logros medibles e indicadores de impacto.' : 'Include measurable achievements and impact metrics.'}</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-[hsl(210,100%,45%)] mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{isEs ? 'Usa formato PDF para mejor compatibilidad.' : 'Use PDF format for best compatibility.'}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* ===================== Video ===================== */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{isEs ? 'Video' : 'Video'}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isEs ? 'Añade una presentación en video para destacar tu perfil ante los empleadores.' : 'Add a video introduction to make your profile stand out to employers.'}
          </p>
        </div>

        {videoSaved && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">
            {isEs ? '¡URL del video guardada con éxito!' : 'Video URL saved successfully!'}
          </div>
        )}

        {videoSaveError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
            {videoSaveError}
          </div>
        )}

        {hasVideo && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">{isEs ? 'Video Actual' : 'Current Video'}</h3>
            <div className="aspect-video rounded-xl overflow-hidden bg-gray-900">
              <iframe
                src={toEmbedUrl(talentProfile!.video_url!)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={t.applicant.videoIntroduction}
              />
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Link2 className="w-5 h-5 text-[hsl(210,100%,45%)]" />
            <h3 className="text-base font-semibold text-foreground">{isEs ? 'Pega el Enlace de tu Video' : 'Paste Your Video URL'}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {isEs ? 'Pega un enlace embed de YouTube o Vimeo para tu presentación en video.' : 'Paste a YouTube or Vimeo embed URL for your video introduction.'}
          </p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="videoUrl">{isEs ? 'URL del Video' : 'Video URL'}</Label>
              <Input
                id="videoUrl"
                value={videoUrl}
                onChange={function (e) { setVideoUrl(e.target.value); }}
                placeholder="https://www.youtube.com/embed/..."
              />
            </div>
            <Button onClick={handleSaveVideo} className="gap-2" disabled={videoSaving}>
              <Save className="w-4 h-4" />
              {videoSaving ? (isEs ? 'Guardando...' : 'Saving...') : (isEs ? 'Guardar URL' : 'Save URL')}
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-foreground mb-3">{isEs ? 'Consejos para el Video' : 'Video Tips'}</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <Video className="w-4 h-4 text-[hsl(210,100%,45%)] mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{isEs ? 'Mantenlo en menos de 3 minutos.' : 'Keep it under 3 minutes.'}</span>
            </li>
            <li className="flex items-start gap-2">
              <Video className="w-4 h-4 text-[hsl(210,100%,45%)] mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{isEs ? 'Preséntate y destaca tus habilidades clave.' : 'Introduce yourself and highlight your key skills.'}</span>
            </li>
            <li className="flex items-start gap-2">
              <Video className="w-4 h-4 text-[hsl(210,100%,45%)] mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{isEs ? 'Habla en inglés para demostrar tu nivel.' : 'Speak in English to demonstrate your proficiency.'}</span>
            </li>
            <li className="flex items-start gap-2">
              <Video className="w-4 h-4 text-[hsl(210,100%,45%)] mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{isEs ? 'Usa buena iluminación y un entorno silencioso.' : 'Use good lighting and a quiet environment.'}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* ===================== Availability ===================== */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{isEs ? 'Disponibilidad' : 'Availability'}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isEs ? 'Configura tu disponibilidad para que las empresas sepan cuándo puedes tener entrevistas e incorporarte.' : 'Set your availability so employers know when you can interview and start working.'}
          </p>
        </div>

        {availSaved && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">
            {isEs ? '¡Disponibilidad guardada con éxito!' : 'Availability saved successfully!'}
          </div>
        )}

        {/* Timezone */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">{isEs ? 'Zona Horaria' : 'Timezone'}</h3>
          <div className="max-w-sm">
            <Select value={availTimezone} onValueChange={setAvailTimezone}>
              <SelectTrigger>
                <SelectValue placeholder={isEs ? 'Seleccionar zona horaria' : 'Select timezone'} />
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
        </div>

        {/* General Availability */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">{isEs ? 'Disponibilidad General' : 'General Availability'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {generalAvailabilityOptions.map(function (option) {
              var isSelected = generalAvailability === option;
              var label = option;
              if (isEs) {
                if (option === 'Available Immediately') label = 'Disponible Inmediatamente';
                else if (option === 'In 2 Weeks') label = 'En 2 Semanas';
                else if (option === 'In 1 Month') label = 'En 1 Mes';
                else if (option === 'Not Available') label = 'No Disponible';
              }
              return (
                <button
                  key={option}
                  type="button"
                  onClick={function () { setGeneralAvailability(option); }}
                  className={
                    'flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ' +
                    (isSelected
                      ? 'border-[hsl(210,100%,45%)] bg-[hsl(210,100%,45%)]/5'
                      : 'border-gray-200 hover:border-gray-300')
                  }
                >
                  <div
                    className={
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center ' +
                      (isSelected ? 'border-[hsl(210,100%,45%)]' : 'border-gray-300')
                    }
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-[hsl(210,100%,45%)]" />
                    )}
                  </div>
                  <span className={
                    'text-sm font-medium ' +
                    (isSelected ? 'text-[hsl(210,100%,45%)]' : 'text-foreground')
                  }>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">{isEs ? 'Horario Semanal' : 'Weekly Schedule'}</h3>

          <div className="space-y-3 mb-6">
            {dayNames.map(function (dayName, index) {
              var dayNum = (index + 1) % 7;
              var daySlots = slots.filter(function (s) { return s.day_of_week === dayNum; });
              return (
                <div key={dayName} className="flex items-start gap-4 py-2">
                  <span className="text-sm font-medium text-foreground w-24 pt-1 shrink-0">
                    {dayName}
                  </span>
                  <div className="flex-1">
                    {daySlots.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {daySlots.map(function (slot) {
                          return (
                            <div
                              key={slot.id}
                              className="flex items-center gap-2 bg-[hsl(210,100%,45%)]/5 border border-[hsl(210,100%,45%)]/20 rounded-lg px-3 py-1.5"
                            >
                              <Clock className="w-3.5 h-3.5 text-[hsl(210,100%,45%)]" />
                              <span className="text-sm text-foreground">
                                {slot.start_time.split(':').slice(0, 2).join(':')} - {slot.end_time.split(':').slice(0, 2).join(':')}
                              </span>
                              <button
                                type="button"
                                onClick={function () { handleDeleteSlot(slot.id); }}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground italic pt-1">{isEs ? 'Sin horarios' : 'No slots'}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Slot */}
          <div className="border-t border-gray-100 pt-5">
            <h4 className="text-sm font-semibold text-foreground mb-3">{isEs ? 'Añadir Horario' : 'Add Time Slot'}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div className="space-y-2">
                <Label>{isEs ? 'Día' : 'Day'}</Label>
                <Select value={newDay} onValueChange={setNewDay}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dayNames.map(function (name, index) {
                      return (
                        <SelectItem key={name} value={String(index + 1)}>
                          {name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isEs ? 'Hora de Inicio' : 'Start Time'}</Label>
                <Select value={newStart} onValueChange={setNewStart}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(function (time) {
                      return (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isEs ? 'Hora de Fin' : 'End Time'}</Label>
                <Select value={newEnd} onValueChange={setNewEnd}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(function (time) {
                      return (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddSlot} className="gap-2">
                <Plus className="w-4 h-4" />
                {isEs ? 'Añadir' : 'Add'}
              </Button>
            </div>
          </div>
        </div>

        {/* Save */}
        <div>
          <Button onClick={handleSaveAvailability} className="gap-2">
            <Save className="w-4 h-4" />
            {isEs ? 'Guardar Disponibilidad' : 'Save Availability'}
          </Button>
        </div>
      </div>
    </div>
  );
}
