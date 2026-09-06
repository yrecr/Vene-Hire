import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Request Access',
  description: 'Request access to VeneHire as a hiring company or as an engineer looking to join our talent program.',
  alternates: { canonical: '/request-sign-up' },
};

export default function RequestSignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
