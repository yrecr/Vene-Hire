import type { Metadata } from 'next';

// page.tsx here is a client component ('use client'), so metadata has to live
// in this sibling server-component layout instead — Next.js merges it in.
export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with VeneHire to hire pre-evaluated engineers or ask about our talent training program.',
  alternates: { canonical: '/contact' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
