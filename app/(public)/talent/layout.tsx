import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = cookies();
  const lang = cookieStore.get('venehire_lang')?.value === 'es' ? 'es' : 'en';

  return {
    title: lang === 'es' ? 'Explorar Talento' : 'Browse Talent',
    description:
      lang === 'es'
        ? 'Explora ingenieros de software pre-evaluados listos para integrarse a tu equipo de desarrollo.'
        : 'Explore pre-vetted, production-ready software engineers available to join your team.',
    alternates: { canonical: '/talent' },
  };
}

export default function TalentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
