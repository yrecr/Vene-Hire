'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Menu, Zap, LogOut } from 'lucide-react';
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-border transition-shadow duration-300 ${
        scrolled ? 'shadow-sm' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight font-display">
              Vene<span className="text-primary">Hire</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
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
                  aria-label="Sign out"
                  onClick={() => { logout(); router.push('/'); }}
                >
                  <LogOut className="w-[18px] h-[18px]" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-sm font-semibold">
                    Sign In
                  </Button>
                </Link>
                <Link href="/request-sign-up">
                  <Button size="sm" className="text-sm font-semibold">
                    Request a Demo
                  </Button>
                </Link>
              </>
            )}
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <nav className="mt-8 space-y-1">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className="block px-4 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-6 pt-6 border-t border-border space-y-2">
                {currentUser ? (
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      className="w-full font-semibold"
                      onClick={() => { logout(); router.push('/'); }}
                    >
                      <LogOut className="w-[18px] h-[18px] mr-2" />
                      Sign Out
                    </Button>
                  </SheetClose>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Link href="/login" className="block">
                        <Button variant="outline" className="w-full font-semibold">
                          Sign In
                        </Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/request-sign-up" className="block">
                        <Button className="w-full font-semibold">Request a Demo</Button>
                      </Link>
                    </SheetClose>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
