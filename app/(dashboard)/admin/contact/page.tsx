'use client';

import { useState, useMemo } from 'react';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { PageLoading } from '@/components/page-loading';
import { RoleBadge } from '@/components/role-badge';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { useData } from '@/lib/data-context';
import { useT } from '@/lib/i18n';
import type { ContactMessage } from '@/types';
import { Eye } from 'lucide-react';

export default function ContactMessagesPage() {
  const { t, formatDate } = useT();
  const { contactMessages, markContactMessageRead, isHydrated } = useData();
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [viewing, setViewing] = useState<ContactMessage | null>(null);

  const statusTabs = useMemo(() => [
    { id: 'All', label: t.admin.tabAll },
    { id: 'New', label: t.admin.tabNew },
    { id: 'Read', label: t.admin.tabRead },
  ], [t]);

  const filtered = useMemo(() => {
    if (activeFilter === 'All') return contactMessages;
    return contactMessages.filter((m) => m.status === activeFilter.toLowerCase());
  }, [contactMessages, activeFilter]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [filtered]
  );

  const openMessage = (item: ContactMessage) => {
    setViewing(item);
    if (item.status === 'new') markContactMessageRead(item.id);
  };

  const columns: DataTableColumn<ContactMessage>[] = useMemo(() => [
    {
      key: 'name',
      header: t.admin.colName,
      render: (item) => <span className="font-medium text-foreground">{item.name}</span>,
    },
    {
      key: 'email',
      header: t.admin.colEmail,
      render: (item) => <span className="text-muted-foreground">{item.email}</span>,
    },
    {
      key: 'subject',
      header: t.admin.colSubject,
      render: (item) => <span className="text-muted-foreground line-clamp-1">{item.subject}</span>,
    },
    {
      key: 'status',
      header: t.admin.colStatus,
      render: (item) => <RoleBadge role={item.status} />,
    },
    {
      key: 'date',
      header: t.admin.colDate,
      render: (item) => (
        <span className="text-muted-foreground">
          {formatDate(item.created_at, {
            month: 'short', day: 'numeric', year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t.admin.colActions,
      render: (item) => (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openMessage(item)}>
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ], [t, formatDate]);

  if (!isHydrated) {
    return (
      <PageLoading />
    );
  }

  const newCount = contactMessages.filter((m) => m.status === 'new').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-foreground">{t.admin.contactMessages}</h2>
        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-[hsl(210,100%,45%)]/10 text-[hsl(210,100%,45%)] border border-[hsl(210,100%,45%)]/20">
          {t.admin.newCountBadge.replace('{count}', String(newCount))}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {statusTabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeFilter === tab.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter(tab.id)}
            className="rounded-full"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <DataTable columns={columns} data={sorted} pageSize={10} emptyMessage={t.admin.noContactMessages} />

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent>
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle>{viewing.subject}</DialogTitle>
                <DialogDescription>{viewing.name} — {viewing.email}</DialogDescription>
              </DialogHeader>
              <p className="text-sm text-foreground bg-gray-50 rounded-lg p-3 leading-relaxed whitespace-pre-wrap">
                {viewing.message}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
