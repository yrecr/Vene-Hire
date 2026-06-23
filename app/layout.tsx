import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { DemoAuthProvider } from '@/lib/demo-auth';
import { MockDataProvider } from '@/lib/data-context';
import { RoleSwitcher } from '@/components/role-switcher';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'VeneHire - Hire Production-Ready Engineers',
  description: 'Access pre-trained, pre-evaluated software engineers ready to integrate into your team from day one.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <DemoAuthProvider>
          <MockDataProvider>
            {children}
            <RoleSwitcher />
          </MockDataProvider>
        </DemoAuthProvider>
      </body>
    </html>
  );
}
