import type { Metadata } from 'next';
import { cookies } from 'next/headers';

// Only ever reached via a one-time invite link — never something to index.
export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = cookies();
  const lang = cookieStore.get('venehire_lang')?.value === 'es' ? 'es' : 'en';

  return {
    title: lang === 'es' ? 'Configura tu Contraseña' : 'Set Your Password',
    description:
      lang === 'es'
        ? 'Configura tu contraseña para acceder a la plataforma de VeneHire.'
        : 'Set your password to access the VeneHire platform.',
    robots: { index: false, follow: false },
  };
}

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
