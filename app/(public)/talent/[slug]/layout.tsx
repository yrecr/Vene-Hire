import type { Metadata } from 'next';

// Static, not per-candidate — a dynamic generateMetadata() here would need its
// own server-side Supabase fetch duplicating the client one page.tsx already
// does. Good enough for now; per-candidate titles can come later if it matters.
export const metadata: Metadata = {
  title: 'Talent Profile',
  description: 'View this engineer’s skills, experience, and availability on VeneHire.',
  robots: { index: false, follow: true },
};

export default function TalentProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
