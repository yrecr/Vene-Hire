'use client';

import { AccountSettingsShell } from '@/components/account-settings-shell';
import { EmployerProfileSettings } from '@/components/employer-profile-settings';

export default function EmployerSettingsPage() {
  return <AccountSettingsShell profileContent={<EmployerProfileSettings />} />;
}
