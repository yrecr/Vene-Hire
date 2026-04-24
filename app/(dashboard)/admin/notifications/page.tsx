'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getNotificationsForUser } from '@/data/mock';
import {
  Bell,
  MessageSquare,
  GitBranch,
  FileText,
  Info,
  CheckCheck,
} from 'lucide-react';

const typeIcons: Record<string, typeof Bell> = {
  request: MessageSquare,
  interview: Bell,
  process: GitBranch,
  contract: FileText,
  info: Info,
};

export default function AdminNotificationsPage() {
  const initialNotifications = getNotificationsForUser('p-admin1');
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-50 text-red-600 border border-red-200">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="gap-2">
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {notifications.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No notifications yet.</p>
          </div>
        )}
        {notifications.map((notification) => {
          const Icon = typeIcons[notification.type] || Info;
          return (
            <div
              key={notification.id}
              className={`bg-white rounded-2xl border p-4 flex items-start gap-4 transition-colors ${
                notification.read
                  ? 'border-gray-100'
                  : 'border-[hsl(210,100%,45%)]/20 bg-[hsl(210,100%,45%)]/[0.02]'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  notification.read
                    ? 'bg-gray-100'
                    : 'bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    notification.read
                      ? 'text-muted-foreground'
                      : 'text-[hsl(210,100%,45%)]'
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3
                    className={`text-sm font-medium ${
                      notification.read ? 'text-muted-foreground' : 'text-foreground'
                    }`}
                  >
                    {notification.title}
                  </h3>
                  {!notification.read && (
                    <span className="w-2 h-2 rounded-full bg-[hsl(210,100%,45%)] flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
                <p className="text-xs text-muted-foreground/70 mt-1.5">
                  {formatTime(notification.created_at)}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                  notification.read
                    ? 'bg-gray-100 text-gray-500'
                    : 'bg-[hsl(210,100%,45%)]/10 text-[hsl(210,100%,45%)]'
                }`}
              >
                {notification.type}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
