import type { Metadata } from 'next';
import { cookies } from 'next/headers';

// Static, not per-candidate — a dynamic generateMetadata() here would need its
// own server-side Supabase fetch duplicating the client one page.tsx already
// does. Good enough for now; per-candidate titles can come later if it matters.
export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = cookies();
  const lang = cookieStore.get('venehire_lang')?.value === 'es' ? 'es' : 'en';

  return {
    title: lang === 'es' ? 'Perfil de Talento' : 'Talent Profile',
    description:
      lang === 'es'
        ? 'Conoce las habilidades, experiencia y disponibilidad de este desarrollador en VeneHire.'
        : 'View this engineer’s skills, experience, and availability on VeneHire.',
    robots: { index: false, follow: true },
  };
}

export default function TalentProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
