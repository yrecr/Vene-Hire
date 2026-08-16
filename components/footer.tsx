import Link from 'next/link';
import { Zap } from 'lucide-react';

// Legal pages do not exist yet. The column is intentionally omitted rather than
// shipped with links that go nowhere -- add it back once the pages are written.
const footerLinks = {
  platform: [
    { href: '/talent', label: 'Browse Talent' },
    { href: '/request-sign-up', label: 'Request Access' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
  ],
  resources: [
    { href: '/about#how-it-works', label: 'How It Works' },
    { href: '/about#bootcamp', label: 'Our Bootcamp' },
    { href: '/about#for-companies', label: 'For Companies' },
    { href: '/about#for-engineers', label: 'For Engineers' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-foreground text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight font-display">
                VeneHire
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Preparing production-ready software engineers through intensive training, real-world simulation, and rigorous evaluation.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} VeneHire. All rights reserved.
          </p>
          <span className="text-sm">Built for the future of hiring.</span>
        </div>
      </div>
    </footer>
  );
}
