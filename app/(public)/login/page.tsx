'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { clearDemoCookie } from '@/lib/demo';
import { Mail, Lock, ArrowRight, CircleAlert as AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useT } from '@/lib/i18n';

const rolePath: Record<string, string> = {
  admin: '/admin',
  applicant: '/applicant',
  employer: '/employer',
};

export default function LoginPage() {
  const { t } = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reaching the real login means leaving the demo sandbox.
  useEffect(() => {
    clearDemoCookie();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !data.session) {
        setError(authError?.message ?? t.auth.loginFailed);
        setLoading(false);
        return;
      }

      const role = (data.session.user.user_metadata?.role as string) || '';
      window.location.href = rolePath[role] || '/';
    } catch {
      setError(t.auth.networkError);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <img src="/logo.png" alt="VeneHire" className="w-10 h-10 object-contain" />
            <span className="text-xl font-bold text-gray-900">VeneHire</span>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{t.auth.welcomeBack}</h1>
            <p className="text-gray-500 mt-1">{t.auth.signInDesc}</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 text-sm text-red-600 bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-400 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">{t.auth.emailLabel}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t.auth.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t.auth.passwordLabel}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder={t.auth.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                t.auth.signingIn
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {t.auth.signInBtn}
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-8">
            {t.auth.invitationOnly}{' '}
            <Link href="/contact" className="text-[hsl(210,100%,45%)] hover:text-[hsl(210,100%,40%)] underline">
              {t.auth.contactUsLink}
            </Link>{' '}
            {t.auth.toLearnMore}
          </p>
        </div>
      </div>
    </div>
  );
}
