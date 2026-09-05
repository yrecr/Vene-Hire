'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';
import { deleteAccount } from '@/lib/supabase-service';
import { DeleteAccountDialog } from '@/components/delete-account-dialog';
import { CircleCheck, CircleAlert, TriangleAlert } from 'lucide-react';

const TABS = ['profile', 'system', 'security', 'about'] as const;
type Tab = typeof TABS[number];
const TAB_LABELS: Record<Tab, string> = {
  profile: 'Profile',
  system: 'System Settings',
  security: 'Security',
  about: 'About',
};

interface AccountSettingsShellProps {
  profileContent: ReactNode;
}

export function AccountSettingsShell({ profileContent }: AccountSettingsShellProps) {
  const [tab, setTab] = useState<Tab>('profile');

  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace('#', '');
      if ((TABS as readonly string[]).includes(hash)) setTab(hash as Tab);
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Account Settings</h2>

      <div className="flex items-center gap-2 flex-wrap">
        {TABS.map((t) => (
          <Button
            key={t}
            variant={tab === t ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setTab(t);
              window.location.hash = t;
            }}
            className="rounded-full"
          >
            {TAB_LABELS[t]}
          </Button>
        ))}
      </div>

      {tab === 'profile' && profileContent}
      {tab === 'system' && <SystemSettingsTab />}
      {tab === 'security' && <SecurityTab />}
      {tab === 'about' && <AboutTab />}
    </div>
  );
}

function SystemSettingsTab() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
      <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 mb-3">
        Coming soon
      </span>
      <p className="text-sm text-muted-foreground">
        System-wide preferences (appearance, language, and more) will live here in a future update.
      </p>
    </div>
  );
}

function SecurityTab() {
  const { currentUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (newPassword.length < 8) {
      setStatus({ type: 'error', message: 'New password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    setLoading(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    if (currentUser?.email) {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: currentPassword,
      });
      if (verifyError) {
        setStatus({ type: 'error', message: 'Current password is incorrect.' });
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      setStatus({ type: 'error', message: error.message });
      return;
    }

    setStatus({ type: 'success', message: 'Password updated successfully.' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-md">
      <h3 className="font-semibold text-foreground mb-4">Change Password</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="current-password">Current password</Label>
          <Input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {status && (
          <div className={`flex items-center gap-2 text-sm ${status.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
            {status.type === 'success' ? <CircleCheck className="w-4 h-4 flex-shrink-0" /> : <CircleAlert className="w-4 h-4 flex-shrink-0" />}
            {status.message}
          </div>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Password'}
        </Button>
      </form>

      <DangerZone />
    </div>
  );
}

function DangerZone() {
  const { currentUser, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!currentUser?.email) return null;

  const handleDelete = async () => {
    await deleteAccount();
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-100">
      <h3 className="font-semibold text-red-600 flex items-center gap-2 mb-1">
        <TriangleAlert className="w-4 h-4" />
        Danger Zone
      </h3>
      <p className="text-sm text-muted-foreground mb-3">
        Permanently delete your account and everything tied to it. This cannot be undone.
      </p>
      <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setOpen(true)}>
        Delete my account
      </Button>
      <DeleteAccountDialog
        open={open}
        onOpenChange={setOpen}
        targetLabel="your account"
        confirmText={currentUser.email}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function AboutTab() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-md space-y-3">
      <div className="flex items-center gap-2">
        <img src="/logo.png" alt="VeneHire" className="w-8 h-8 object-contain" />
        <span className="text-lg font-bold text-foreground">VeneHire</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Preparing production-ready software engineers through intensive training, real-world simulation, and rigorous evaluation.
      </p>
      <p className="text-xs text-muted-foreground">
        Need help? <a href="/contact" className="text-[hsl(210,100%,45%)] hover:underline">Contact us</a>.
      </p>
    </div>
  );
}
