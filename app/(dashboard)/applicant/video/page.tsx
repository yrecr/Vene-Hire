'use client';

import { useState, useMemo } from 'react';
import { Video, Upload, Link2, Save } from 'lucide-react';
import { useDemoAuth } from '@/lib/demo-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMockData } from '@/lib/data-context';

export default function ApplicantVideoPage() {
  const { currentUser } = useDemoAuth();
  const { talentProfiles } = useMockData();
  const user = currentUser;

  const talentProfile = useMemo(function () {
    if (!user?.talent_profile_id) return null;
    return talentProfiles.find(function (t) { return t.id === user.talent_profile_id; }) || null;
  }, [user, talentProfiles]);

  const [videoUrl, setVideoUrl] = useState(talentProfile?.video_url || '');
  const [saved, setSaved] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Please sign in</h2>
          <p className="text-muted-foreground">Sign in with an applicant account to manage your video.</p>
        </div>
      </div>
    );
  }

  function handleSave() {
    setSaved(true);
    setTimeout(function () { setSaved(false); }, 3000);
  }

  const hasVideo = !!talentProfile?.video_url;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">My Video</h2>
        <p className="text-muted-foreground mt-1">
          Add a video introduction to make your profile stand out to employers.
        </p>
      </div>

      {/* Save feedback */}
      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">
          Video URL saved successfully! (Demo mode - changes are not persisted)
        </div>
      )}

      {/* Current video preview */}
      {hasVideo && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Current Video</h3>
          <div className="aspect-video rounded-xl overflow-hidden bg-gray-900">
            <iframe
              src={talentProfile!.video_url!}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video introduction"
            />
          </div>
        </div>
      )}

      {/* Paste URL */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="w-5 h-5 text-[hsl(210,100%,45%)]" />
          <h3 className="text-base font-semibold text-foreground">Paste Your Video URL</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Paste a YouTube or Vimeo embed URL for your video introduction.
        </p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL</Label>
            <Input
              id="videoUrl"
              value={videoUrl}
              onChange={function (e) { setVideoUrl(e.target.value); }}
              placeholder="https://www.youtube.com/embed/..."
            />
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Save URL
          </Button>
        </div>
      </div>

      {/* Upload area */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5 text-[hsl(210,100%,45%)]" />
          <h3 className="text-base font-semibold text-foreground">Upload a Video</h3>
        </div>
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center hover:border-[hsl(210,100%,45%)]/40 transition-colors cursor-pointer">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center mx-auto mb-4">
            <Video className="w-7 h-7 text-[hsl(210,100%,45%)]" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            Drop your video here or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Supports MP4, MOV, WebM (max 100MB)
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-foreground mb-3">Video Tips</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <Video className="w-4 h-4 text-[hsl(210,100%,45%)] mt-0.5 shrink-0" />
            <span className="text-sm text-muted-foreground">Keep it under 3 minutes.</span>
          </li>
          <li className="flex items-start gap-2">
            <Video className="w-4 h-4 text-[hsl(210,100%,45%)] mt-0.5 shrink-0" />
            <span className="text-sm text-muted-foreground">Introduce yourself and highlight your key skills.</span>
          </li>
          <li className="flex items-start gap-2">
            <Video className="w-4 h-4 text-[hsl(210,100%,45%)] mt-0.5 shrink-0" />
            <span className="text-sm text-muted-foreground">Speak in English to demonstrate your proficiency.</span>
          </li>
          <li className="flex items-start gap-2">
            <Video className="w-4 h-4 text-[hsl(210,100%,45%)] mt-0.5 shrink-0" />
            <span className="text-sm text-muted-foreground">Use good lighting and a quiet environment.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
