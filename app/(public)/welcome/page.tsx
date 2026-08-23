'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lock, ArrowRight, CircleAlert as AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

const rolePath: Record<string, string> = {
  admin: '/admin',
  applicant: '/applicant',
  employer: '/employer',
};

const supabaseClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

type Phase = 'verifying' | 'ready' | 'invalid';

export default function WelcomePage() {
  const [phase, setPhase] = useState<Phase>('verifying');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // The invitation link lands here with the session in the URL fragment
  // (#access_token=...&refresh_token=...). Exchange it for a real session so
  // the user can set a password, then clear the fragment from the address bar.
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const linkError = params.get('error_description');

    if (linkError || !accessToken || !refreshToken) {
      setError(linkError || 'This invitation link is invalid or has already been used.');
      setPhase('invalid');
      return;
    }

    supabaseClient()
      .auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ data, error: sessionError }) => {
        if (sessionError || !data.session) {
          setError(sessionError?.message ?? 'This invitation link has expired.');
          setPhase('invalid');
          return;
        }
        setEmail(data.session.user.email ?? '');
        window.history.replaceState(null, '', window.location.pathname);
        setPhase('ready');
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password and confirmation do not match.');
      return;
    }

    setSaving(true);
    const { data, error: updateError } = await supabaseClient().auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    const role = (data.user?.user_metadata?.role as string) || '';
    window.location.href = rolePath[role] || '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <img src="/logo.png" alt="VeneHire" className="w-10 h-10 object-contain" />
            <span className="text-xl font-bold text-gray-900">VeneHire</span>
          </div>

          {phase === 'verifying' && (
            <p className="text-center text-gray-500 py-8">Verifying your invitation...</p>
          )}

          {phase === 'invalid' && (
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Invitation unavailable</h1>
              <div className="flex items-center gap-2 p-3 my-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              <p className="text-sm text-gray-500">
                Ask an administrator to send you a new invitation, or{' '}
                <Link href="/login" className="text-[hsl(210,100%,45%)] hover:text-[hsl(210,100%,40%)] underline">
                  sign in
                </Link>{' '}
                if you already set a password.
              </p>
            </div>
          )}

          {phase === 'ready' && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Welcome to VeneHire</h1>
                <p className="text-gray-500 mt-1">
                  Choose a password for {email || 'your account'} to finish setting it up.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? (
                    'Saving...'
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Set password and continue
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
