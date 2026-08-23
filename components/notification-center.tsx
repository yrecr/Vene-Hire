'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, MessageSquare, GitBranch, FileText, Inbox, Info } from 'lucide-react';
import type { Notification } from '@/types';
import * as api from '@/lib/supabase-service';

interface NotificationCenterProps {
  notifications: Notification[];
  role?: 'admin' | 'applicant' | 'employer';
}

const routeByRole: Record<string, Partial<Record<Notification['type'], string>>> = {
  admin: {
    interview: '/admin/processes',
    process: '/admin/processes',
    contract: '/admin/processes',
    request: '/admin/requests',
  },
  employer: {
    interview: '/employer/requests',
    process: '/employer/processes',
    contract: '/employer/processes',
    request: '/employer/requests',
  },
  applicant: {
    interview: '/applicant/interviews',
    process: '/applicant/processes',
    contract: '/applicant/contract',
    request: '/applicant/interviews',
  },
};

const typeIcons: Record<Notification['type'], typeof Info> = {
  info: Info,
  interview: MessageSquare,
  process: GitBranch,
  contract: FileText,
  request: Inbox,
};

const typeColors: Record<Notification['type'], string> = {
  info: 'bg-blue-50 text-[hsl(210,100%,45%)]',
  interview: 'bg-teal-50 text-[hsl(170,60%,42%)]',
  process: 'bg-purple-50 text-purple-600',
  contract: 'bg-amber-50 text-amber-600',
  request: 'bg-emerald-50 text-emerald-600',
};

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function NotificationCenter({ notifications: initialNotifications, role }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  function handleMarkAllRead() {
    const ids = notifications.filter((n) => !n.read).map((n) => n.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    ids.forEach((id) => api.markNotificationRead(id).catch(() => {}));
  }

  function handleNotificationClick(notification: Notification) {
    if (!notification.read) {
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)));
      api.markNotificationRead(notification.id).catch(() => {});
    }
    const target = role ? routeByRole[role]?.[notification.type] : undefined;
    if (target) {
      setIsOpen(false);
      router.push(target);
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-[hsl(210,100%,45%)] hover:text-[hsl(210,100%,35%)] transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = typeIcons[notification.type];
                const iconColor = typeColors[notification.type];

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                      !notification.read ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-tight ${!notification.read ? 'font-semibold text-foreground' : 'font-medium text-gray-700'}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-[hsl(210,100%,45%)] flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {getRelativeTime(notification.created_at)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {role && (
            <div className="border-t border-gray-100 px-4 py-2.5 text-center">
              <button
                onClick={() => { setIsOpen(false); router.push(`/${role}/notifications`); }}
                className="text-xs font-medium text-[hsl(210,100%,45%)] hover:text-[hsl(210,100%,35%)] transition-colors"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
