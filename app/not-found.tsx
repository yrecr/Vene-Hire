import Link from 'next/link';
import { cookies } from 'next/headers';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';
import { en } from '@/lib/i18n/en';
import { es } from '@/lib/i18n/es';

export default function NotFound() {
  const cookieStore = cookies();
  const lang = cookieStore.get('venehire_lang')?.value === 'es' ? 'es' : 'en';
  const t = lang === 'es' ? es : en;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-14 h-14 rounded-full bg-[hsl(210,100%,45%)]/10 flex items-center justify-center mb-6">
          <Compass className="w-7 h-7 text-[hsl(210,100%,45%)]" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{t.common.notFound}</h1>
        <p className="text-muted-foreground mb-8">
          {t.common.notFoundDesc}
        </p>
        <Link href="/">
          <Button className="bg-gradient-to-r from-[hsl(210,100%,45%)] to-[hsl(210,100%,38%)] text-white">
            {t.common.backToHome}
          </Button>
        </Link>
      </div>
    </div>
  );
}
