'use client';

import { useState } from 'react';
import {
  Bell,
  MessageSquare,
  GitBranch,
  FileText,
  Info,
  CheckCheck,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data-context';
import type { LucideIcon } from 'lucide-react';

function getNotificationIcon(type: string): LucideIcon {
  switch (type) {
    case 'interview':
      return MessageSquare;
    case 'process':
      return GitBranch;
    case 'contract':
      return FileText;
    case 'info':
      return Info;
    default:
      return Bell;
  }
}

function getNotificationIconColor(type: string): string {
  switch (type) {
    case 'interview':
      return 'bg-blue-50 text-primary';
    case 'process':
      return 'bg-teal-50 text-accent';
    case 'contract':
      return 'bg-amber-50 text-amber-600';
    case 'info':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

export default function EmployerNotificationsPage() {
  const { currentUser } = useAuth();
  const { getNotificationsForUser } = useData();
  const profileId = currentUser?.profile_id || 'p-acme';
  const notifications = getNotificationsForUser(profileId);

  const [readState, setReadState] = useState<Record<string, boolean>>(() => {
    const state: Record<string, boolean> = {};
    notifications.forEach((n) => {
      state[n.id] = n.read;
    });
    return state;
  });

  const markAllAsRead = () => {
    const newState: Record<string, boolean> = {};
    notifications.forEach((n) => {
      newState[n.id] = true;
    });
    setReadState(newState);
  };

  const unreadCount = notifications.filter((n) => !readState[n.id]).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
          <p className="text-muted-foreground mt-1">
            Stay updated on your hiring activity.
            {unreadCount > 0 && (
              <span className="ml-1 font-medium text-primary">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={markAllAsRead}
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up! New notifications will appear here."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
          {notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const iconColor = getNotificationIconColor(notification.type);
            const isRead = readState[notification.id];
            const joinUrl = notification.metadata?.join_url;

            return (
              <div
                key={notification.id}
                className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                  isRead ? 'bg-white' : 'bg-blue-50/30'
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className={`text-sm font-medium ${
                        isRead ? 'text-foreground' : 'text-foreground font-semibold'
                      }`}
                    >
                      {notification.title}
                    </h3>
                    {/* Read/unread dot */}
                    {!isRead && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {notification.message}
                  </p>
                  {joinUrl && (
                    <a
                      href={joinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Join Meeting
                    </a>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.created_at).toLocaleDateString(
                      'en-US',
                      {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      }
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
