import type { Metadata } from 'next';

// Auth utility page, not a marketing page — keep it out of search results.
export const metadata: Metadata = {
  title: 'Sign In',
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
