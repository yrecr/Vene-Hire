import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { AboutClient } from './about-client';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = cookies();
  const lang = cookieStore.get('venehire_lang')?.value === 'es' ? 'es' : 'en';

  return {
    title: lang === 'es' ? 'Sobre Nosotros' : 'About Us',
    description:
      lang === 'es'
        ? 'Conoce cómo VeneHire entrena y evalúa ingenieros de software antes de conectarlos con empresas listas para contratar.'
        : 'Learn how VeneHire trains and evaluates software engineers before matching them with companies ready to hire production-ready talent.',
    alternates: { canonical: '/about' },
  };
}

export default function AboutPage() {
  return <AboutClient />;
}
