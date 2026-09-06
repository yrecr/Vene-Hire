import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth';
import { DataProvider } from '@/lib/data-context';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// ponytail: update this once the Venesoft custom domain is live — canonical
// URLs, og:image, and the JSON-LD below all resolve relative to this.
const SITE_URL = 'https://venehire.vercel.app';
const SITE_NAME = 'VeneHire';
const DEFAULT_TITLE = 'VeneHire - Hire Production-Ready Engineers';
const DEFAULT_DESCRIPTION = 'Access pre-trained, pre-evaluated software engineers ready to integrate into your team from day one.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    images: ['/logo.png'],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ['/logo.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      description: DEFAULT_DESCRIPTION,
    },
    {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <DataProvider>
            {children}
            <Toaster />
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
