import type { Metadata } from 'next';
import { cookies } from 'next/headers';

// page.tsx here is a client component ('use client'), so metadata has to live
// in this sibling server-component layout instead — Next.js merges it in.
export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = cookies();
  const lang = cookieStore.get('venehire_lang')?.value === 'es' ? 'es' : 'en';

  return {
    title: lang === 'es' ? 'Contacto' : 'Contact',
    description:
      lang === 'es'
        ? 'Ponte en contacto con VeneHire para contratar ingenieros pre-evaluados o conocer nuestros programas de capacitación.'
        : 'Get in touch with VeneHire to hire pre-evaluated engineers or ask about our talent training program.',
    alternates: { canonical: '/contact' },
  };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
