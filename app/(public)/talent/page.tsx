import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { TalentClient } from './talent-client';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = cookies();
  const lang = cookieStore.get('venehire_lang')?.value === 'es' ? 'es' : 'en';

  return {
    title: lang === 'es' ? 'Explorar Talento' : 'Browse Talent',
    description:
      lang === 'es'
        ? 'Explora ingenieros de software calificados y listos para integrarse a tu equipo de trabajo.'
        : 'Browse our curated pool of pre-trained, vetted software engineers ready to join your team.',
    alternates: { canonical: '/talent' },
  };
}

export default function TalentPage() {
  return <TalentClient />;
}
