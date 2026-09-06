import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Talent',
  description: 'Explore pre-vetted, production-ready software engineers available to join your team.',
  alternates: { canonical: '/talent' },
};

export default function TalentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
