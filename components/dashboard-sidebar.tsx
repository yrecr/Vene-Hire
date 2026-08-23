'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SidebarLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardSidebarProps {
  links: SidebarLink[];
  role: string;
  open: boolean;
  onClose: () => void;
}

export function DashboardSidebar({ links, role, open, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="VeneHire" className="w-8 h-8 object-contain" />
            <span className="text-lg font-bold text-foreground tracking-tight">
              Vene<span className="gradient-text">Hire</span>
            </span>
          </Link>
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-3 pt-4 pb-2">
          <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {role} Portal
          </span>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-[hsl(210,100%,45%)]/10 text-[hsl(210,100%,45%)]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-gray-50'
                )}
              >
                <link.icon className={cn('w-[18px] h-[18px]', active ? 'text-[hsl(210,100%,45%)]' : '')} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gray-50 transition-all"
          >
            Back to Website
          </Link>
        </div>
      </aside>
    </>
  );
}
