import type { Metadata } from 'next';

// Only ever reached via a one-time invite link — never something to index.
export const metadata: Metadata = {
  title: 'Set Your Password',
  robots: { index: false, follow: false },
};

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
