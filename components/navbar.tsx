'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X, Zap, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data-context';
import { NotificationCenter } from '@/components/notification-center';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/talent', label: 'Browse Talent' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const { currentUser, logout } = useAuth();
  const { notifications } = useData();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-lg shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[hsl(210,100%,45%)] to-[hsl(170,60%,42%)] flex items-center justify-center transition-transform group-hover:scale-105">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">
              Vene<span className="gradient-text">Hire</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <>
                <NotificationCenter
                  notifications={notifications.filter((n) => n.user_id === currentUser.profile_id)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { logout(); router.push('/'); }}
                >
                  <LogOut className="w-[18px] h-[18px]" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-sm font-medium">
                    Sign In
                  </Button>
                </Link>
                <Link href="/request-sign-up?type=applicant">
                  <Button variant="outline" size="sm" className="text-sm font-medium">
                    Apply as Talent
                  </Button>
                </Link>
                <Link href="/request-sign-up">
                  <Button size="sm" className="text-sm font-medium bg-gradient-to-r from-[hsl(210,100%,45%)] to-[hsl(210,100%,38%)] hover:from-[hsl(210,100%,40%)] hover:to-[hsl(210,100%,33%)] text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all">
                    Request a Demo
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              {currentUser ? (
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() => { logout(); router.push('/'); setMobileOpen(false); }}
                >
                  <LogOut className="w-[18px] h-[18px] mr-2" />
                  Sign Out
                </Button>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/request-sign-up?type=applicant" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full" size="sm">
                      Apply as Talent
                    </Button>
                  </Link>
                  <Link href="/request-sign-up" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-[hsl(210,100%,45%)] to-[hsl(210,100%,38%)] text-white" size="sm">
                      Request a Demo
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
