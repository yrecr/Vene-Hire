'use client';

import { useState, useMemo } from 'react';
import { Save } from 'lucide-react';
import { useDemoAuth } from '@/lib/demo-auth';
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
import { mockTalentProfiles, demoUsers } from '@/data/mock';

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
  const { currentUser } = useDemoAuth();
  const user = currentUser ?? demoUsers.find(function (u) { return u.role === 'applicant'; }) ?? null;

  const talentProfile = useMemo(function () {
    if (!user?.talent_profile_id) return null;
    return mockTalentProfiles.find(function (t) { return t.id === user.talent_profile_id; }) || null;
  }, [user]);

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

  function handleSave() {
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
          Profile saved successfully! (Demo mode - changes are not persisted)
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
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
    </div>
  );
}
