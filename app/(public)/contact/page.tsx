import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { ContactClient } from './contact-client';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = cookies();
  const lang = cookieStore.get('venehire_lang')?.value === 'es' ? 'es' : 'en';

  return {
    title: lang === 'es' ? 'Contacto' : 'Contact Us',
    description:
      lang === 'es'
        ? 'Ponte en contacto con VeneHire para contratar talento o conocer nuestros programas de capacitación.'
        : 'Get in touch with VeneHire to hire pre-evaluated software engineers or learn more about our accelerator program.',
    alternates: { canonical: '/contact' },
  };
}

export default function ContactPage() {
  return <ContactClient />;
}
