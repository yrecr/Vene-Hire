import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How VeneHire collects, uses, and protects your personal information.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: September 2026</p>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Information we collect</h2>
          <p>
            When you request access, apply as talent, or contact us, we collect the information you
            submit directly — such as your name, email address, company name, and any message you send.
            If you are hired through the platform, we also store hiring-related information such as your
            role, hourly rate, and hours worked, so employers and administrators can manage contracts and
            billing.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">How we use it</h2>
          <p>
            We use your information to operate the platform: to review access requests, match engineers
            with companies, schedule interviews, manage contracts, and process hours and billing. We do
            not sell your personal information to third parties.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Data storage and security</h2>
          <p>
            Your data is stored with Supabase and protected with row-level security policies, so accounts
            can only access the information relevant to their own role. Access to administrative functions
            is restricted to authorized VeneHire staff.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Your choices</h2>
          <p>
            You can request that we update or delete your account and associated data at any time by
            contacting us, or directly from your account settings if you already have access to the
            platform.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Contact</h2>
          <p>
            Questions about this policy? Reach out through our{' '}
            <a href="/contact" className="text-[hsl(210,100%,45%)] hover:underline">Contact page</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
