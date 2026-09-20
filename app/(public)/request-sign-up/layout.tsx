import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = cookies();
  const lang = cookieStore.get('venehire_lang')?.value === 'es' ? 'es' : 'en';

  return {
    title: lang === 'es' ? 'Solicitar Acceso' : 'Request Access',
    description:
      lang === 'es'
        ? 'Solicita acceso a VeneHire como empresa contratante o como desarrollador buscando unirte a nuestro programa de talento.'
        : 'Request access to VeneHire as a hiring company or as an engineer looking to join our talent program.',
    alternates: { canonical: '/request-sign-up' },
  };
}

export default function RequestSignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
