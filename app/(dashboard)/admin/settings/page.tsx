'use client';

import { useEffect, useState } from 'react';
import { Pencil, Save, X } from 'lucide-react';
import { AccountSettingsShell } from '@/components/account-settings-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data-context';
import * as api from '@/lib/supabase-service';

function AdminProfile() {
  const { currentUser } = useAuth();
  const { profiles, setProfiles } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState(currentUser?.full_name || '');

  const profile = profiles.find((p) => p.id === currentUser?.profile_id);

  // currentUser (from /api/auth/me) and profiles (from data-context) hydrate
  // independently — resync once profiles loads, but never clobber a
  // in-progress edit (same pattern as employer/applicant settings).
  useEffect(() => {
    if (isEditing || !profile) return;
    setFullName(profile.full_name);
  }, [profile, isEditing]);

  const handleSave = async () => {
    if (!profile || !fullName.trim()) return;
    setSaving(true);
    const updated = { ...profile, full_name: fullName.trim() };
    await api.upsertProfile(updated).catch(() => {});
    setProfiles(profiles.map((p) => (p.id === profile.id ? updated : p)));
    setSaving(false);
    setIsEditing(false);
    // currentUser (header initials, greeting) comes from a separate
    // /api/auth/me fetch with no listener — a hard reload is the simplest
    // way to pick up the new name everywhere without wiring a refetch.
    window.location.reload();
  };

  const initials = (isEditing ? fullName : currentUser?.full_name || '')
    .split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-md space-y-4">
      <div className="flex items-center justify-between">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[hsl(210,100%,45%)] to-[hsl(170,60%,42%)] flex items-center justify-center text-white text-lg font-semibold">
          {initials}
        </div>
        {!isEditing && (
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setIsEditing(true)}>
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </Button>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="admin-full-name">Full name</Label>
        {isEditing ? (
          <Input id="admin-full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        ) : (
          <p className="font-medium text-foreground">{currentUser?.full_name}</p>
        )}
      </div>

      <div>
        <p className="text-sm text-muted-foreground">Email</p>
        <p className="font-medium text-foreground">{currentUser?.email}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Role</p>
        <p className="font-medium text-foreground capitalize">{currentUser?.role}</p>
      </div>

      {isEditing && (
        <div className="flex items-center gap-2 pt-2">
          <Button size="sm" className="gap-1.5" disabled={saving || !fullName.trim()} onClick={handleSave}>
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button
            variant="outline" size="sm" className="gap-1.5" disabled={saving}
            onClick={() => { setIsEditing(false); setFullName(profile?.full_name || ''); }}
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

export default function AdminSettingsPage() {
  return <AccountSettingsShell profileContent={<AdminProfile />} />;
}
