import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { PrivacyClient } from './privacy-client';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = cookies();
  const lang = cookieStore.get('venehire_lang')?.value === 'es' ? 'es' : 'en';

  return {
    title: lang === 'es' ? 'Política de Privacidad' : 'Privacy Policy',
    description:
      lang === 'es'
        ? 'Cómo VeneHire recopila, utiliza y protege tu información personal.'
        : 'How VeneHire collects, uses, and protects your personal information.',
    alternates: { canonical: '/privacy' },
  };
}

export default function PrivacyPage() {
  return <PrivacyClient />;
}
