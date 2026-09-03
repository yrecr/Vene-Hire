'use client';

import { useMemo, useState } from 'react';
import { Clock, FileText, Send, CircleCheck as CheckCircle2, CircleX } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { RoleBadge } from '@/components/role-badge';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { useData } from '@/lib/data-context';
import type { Timesheet } from '@/types';

const EVENT_ICON = { submitted: Send, approved: CheckCircle2, rejected: CircleX } as const;

export default function AdminTimesheetsPage() {
  const { timesheets, timesheetEvents, selectionProcesses, getApplicantById, getEmployerById, profiles, isHydrated } = useData();
  const [viewing, setViewing] = useState<Timesheet | null>(null);

  const rows = useMemo(() => {
    return [...timesheets].sort((a, b) => b.updated_at.localeCompare(a.updated_at)).map((t) => {
      const process = selectionProcesses.find((p) => p.id === t.process_id);
      const applicant = process ? getApplicantById(process.applicant_id) : undefined;
      const employer = process ? getEmployerById(process.employer_id) : undefined;
      return { ...t, applicantName: applicant?.display_name || 'Unknown', companyName: employer?.company_name || 'Unknown' };
    });
  }, [timesheets, selectionProcesses, getApplicantById, getEmployerById]);

  const viewingEvents = useMemo(() => {
    if (!viewing) return [];
    return timesheetEvents
      .filter((e) => e.timesheet_id === viewing.id)
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((e) => ({
        ...e,
        actorName: profiles.find((p) => p.id === e.actor_profile_id)?.full_name || 'Unknown',
      }));
  }, [viewing, timesheetEvents, profiles]);

  const columns: DataTableColumn<(typeof rows)[number]>[] = [
    { key: 'applicant', header: 'Applicant', render: (r) => <span className="font-medium text-foreground">{r.applicantName}</span> },
    { key: 'company', header: 'Company', render: (r) => <span className="text-muted-foreground">{r.companyName}</span> },
    { key: 'month', header: 'Month', render: (r) => <span className="text-muted-foreground">{r.month}</span> },
    { key: 'hours', header: 'Hours', render: (r) => <span className="text-muted-foreground">{r.total_hours}h</span> },
    { key: 'status', header: 'Status', render: (r) => <RoleBadge role={r.status} /> },
    {
      key: 'invoice',
      header: 'Billing Statement',
      render: (r) => r.invoice_url ? (
        <a href={r.invoice_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[hsl(210,100%,45%)] hover:underline text-sm">
          <FileText className="w-3.5 h-3.5" /> View
        </a>
      ) : <span className="text-xs text-muted-foreground">—</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <Button variant="ghost" size="sm" onClick={() => setViewing(r)}>
          History
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
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-foreground">Hours & Billing</h2>
        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-[hsl(210,100%,45%)]/10 text-[hsl(210,100%,45%)] border border-[hsl(210,100%,45%)]/20">
          {timesheets.length}
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No hours have been reported yet.</p>
        </div>
      ) : (
        <DataTable columns={columns} data={rows} />
      )}

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent>
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle>Timesheet History</DialogTitle>
                <DialogDescription>{viewing.month} — {viewing.total_hours}h total</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                {viewingEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No events recorded.</p>
                ) : (
                  viewingEvents.map((e) => {
                    const Icon = EVENT_ICON[e.event_type];
                    return (
                      <div key={e.id} className="flex items-start gap-3">
                        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          e.event_type === 'approved' ? 'text-emerald-600' : e.event_type === 'rejected' ? 'text-red-600' : 'text-blue-600'
                        }`} />
                        <div>
                          <p className="text-sm text-foreground capitalize">
                            <span className="font-medium">{e.actorName}</span> {e.event_type} the hours
                          </p>
                          {e.comment && <p className="text-xs text-muted-foreground mt-0.5">&quot;{e.comment}&quot;</p>}
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(e.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
