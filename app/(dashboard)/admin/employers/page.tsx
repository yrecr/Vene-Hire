'use client';

import { useState } from 'react';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { RoleBadge } from '@/components/role-badge';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { useData } from '@/lib/data-context';
import type { EmployerProfile } from '@/types';
import { Eye } from 'lucide-react';

export default function EmployerManagementPage() {
  const { employerProfiles, isHydrated } = useData();
  const [viewing, setViewing] = useState<EmployerProfile | null>(null);

  const columns: DataTableColumn<EmployerProfile>[] = [
    {
      key: 'company',
      header: 'Company Name',
      render: (item) => <span className="font-medium text-foreground">{item.company_name}</span>,
    },
    {
      key: 'contact',
      header: 'Contact Name',
      render: (item) => <span className="text-muted-foreground">{item.contact_name}</span>,
    },
    {
      key: 'hiring_needs',
      header: 'Hiring Needs',
      render: (item) => (
        <span className="text-muted-foreground" title={item.hiring_needs}>
          {item.hiring_needs.length > 40
            ? item.hiring_needs.slice(0, 40) + '...'
            : item.hiring_needs}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <RoleBadge role={item.status} />,
    },
    {
      key: 'created',
      header: 'Created',
      render: (item) => (
        <span className="text-muted-foreground">
          {new Date(item.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setViewing(item)}>
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-foreground">Employers</h2>
        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-[hsl(210,100%,45%)]/10 text-[hsl(210,100%,45%)] border border-[hsl(210,100%,45%)]/20">
          {employerProfiles.length}
        </span>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={employerProfiles} />

      {/* Detail dialog */}
      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent>
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle>{viewing.company_name}</DialogTitle>
                <DialogDescription>{viewing.contact_name}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Status</span>
                  <RoleBadge role={viewing.status} />
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Hiring needs</p>
                  <p className="text-foreground leading-relaxed">{viewing.hiring_needs}</p>
                </div>
                {viewing.summary && (
                  <div>
                    <p className="text-muted-foreground mb-1">Summary</p>
                    <p className="text-foreground bg-gray-50 rounded-lg p-3 leading-relaxed">{viewing.summary}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
