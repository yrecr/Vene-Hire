'use client';

import { AccountSettingsShell } from '@/components/account-settings-shell';
import { ApplicantProfileSettings } from '@/components/applicant-profile-settings';

export default function ApplicantSettingsPage() {
  return <AccountSettingsShell profileContent={<ApplicantProfileSettings />} />;
}
