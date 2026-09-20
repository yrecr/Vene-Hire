import type { Metadata } from 'next';
import { cookies } from 'next/headers';

// Auth utility page, not a marketing page — keep it out of search results.
export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = cookies();
  const lang = cookieStore.get('venehire_lang')?.value === 'es' ? 'es' : 'en';

  return {
    title: lang === 'es' ? 'Iniciar Sesión' : 'Sign In',
    description:
      lang === 'es'
        ? 'Inicia sesión en VeneHire para acceder a tu portal.'
        : 'Sign in to VeneHire to access your dashboard.',
    robots: { index: false, follow: false },
  };
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
