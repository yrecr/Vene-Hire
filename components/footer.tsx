'use client';

import Link from 'next/link';
import { useT } from '@/lib/i18n';

export function Footer() {
  const { t } = useT();

  const footerLinks = {
    platform: [
      { href: '/talent', label: t.nav.browseTalent },
      { href: '/request-sign-up', label: t.nav.register },
      { href: '/demo', label: t.demo.enterDemo },
      { href: '/about', label: t.footer.aboutUs },
      { href: '/contact', label: t.footer.contact },
    ],
    resources: [
      { href: '/about#how-it-works', label: t.about.howItWorksTitle },
      { href: '/about#bootcamp', label: t.home.feat1Title },
      { href: '/about#for-companies', label: t.about.forCompaniesTitle },
      { href: '/about#for-engineers', label: t.about.forEngineersTitle },
    ],
    legal: [
      { href: '/privacy', label: t.footer.privacyPolicy },
      { href: '#', label: t.footer.termsOfService },
    ],
  };

  return (
    <footer className="bg-[hsl(220,20%,7%)] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <img src="/logo.png" alt="VeneHire" className="w-9 h-9 object-contain" />
              <span className="text-xl font-bold text-white tracking-tight">
                VeneHire
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              {t.footer.tagline}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{t.footer.platform}</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{t.admin.resources}</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{t.footer.legal}</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            {new Date().getFullYear()} VeneHire. {t.footer.allRightsReserved}
          </p>
        </div>
      </div>
    </footer>
  );
}
