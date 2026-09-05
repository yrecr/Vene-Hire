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
import type { ContactMessage } from '@/types';
import { Eye } from 'lucide-react';

const statusTabs = ['All', 'New', 'Read'] as const;

export default function ContactMessagesPage() {
  const { contactMessages, markContactMessageRead, isHydrated } = useData();
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [viewing, setViewing] = useState<ContactMessage | null>(null);

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

  const columns: DataTableColumn<ContactMessage>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (item) => <span className="font-medium text-foreground">{item.name}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (item) => <span className="text-muted-foreground">{item.email}</span>,
    },
    {
      key: 'subject',
      header: 'Subject',
      render: (item) => <span className="text-muted-foreground line-clamp-1">{item.subject}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <RoleBadge role={item.status} />,
    },
    {
      key: 'date',
      header: 'Date',
      render: (item) => (
        <span className="text-muted-foreground">
          {new Date(item.created_at).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openMessage(item)}>
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  if (!isHydrated) {
    return (
      <PageLoading />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-foreground">Contact Messages</h2>
        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-[hsl(210,100%,45%)]/10 text-[hsl(210,100%,45%)] border border-[hsl(210,100%,45%)]/20">
          {contactMessages.filter((m) => m.status === 'new').length} new
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {statusTabs.map((tab) => (
          <Button
            key={tab}
            variant={activeFilter === tab ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter(tab)}
            className="rounded-full"
          >
            {tab}
          </Button>
        ))}
      </div>

      <DataTable columns={columns} data={sorted} pageSize={10} emptyMessage="No contact messages yet." />

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
