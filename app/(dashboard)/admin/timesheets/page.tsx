'use client';

import { useMemo, useState } from 'react';
import { Clock, FileText, Send, CircleCheck as CheckCircle2, CircleX } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { RoleBadge } from '@/components/role-badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { useData } from '@/lib/data-context';
import type { Timesheet } from '@/types';

const EVENT_ICON = { submitted: Send, approved: CheckCircle2, rejected: CircleX } as const;

export default function AdminTimesheetsPage() {
  const { timesheets, timesheetEvents, selectionProcesses, getApplicantById, getEmployerById, getProcessById, profiles, reviewTimesheet, isHydrated } = useData();
  const { toast } = useToast();
  const [viewing, setViewing] = useState<Timesheet | null>(null);
  const [reviewing, setReviewing] = useState<Timesheet | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleReview = async (decision: 'approved' | 'rejected') => {
    if (!reviewing) return;
    if (decision === 'rejected' && !rejectComment.trim()) {
      toast({ title: 'Add a comment', description: 'Let the engineer know what to correct before rejecting.', variant: 'destructive' });
      return;
    }
    const process = getProcessById(reviewing.process_id);
    if (decision === 'approved' && process?.hourly_rate == null) {
      toast({ title: 'Set an hourly rate first', description: 'The employer needs to set an hourly rate for this process before hours can be approved.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await reviewTimesheet(reviewing.id, decision, rejectComment.trim() || undefined);
      toast({ title: decision === 'approved' ? 'Hours approved' : 'Sent back for corrections' });
      setReviewing(null);
      setRejectComment('');
    } catch (err) {
      toast({ title: 'Could not review hours', description: err instanceof Error ? err.message : 'Try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

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
        <div className="flex items-center gap-1">
          {r.status === 'submitted' && (
            <Button size="sm" onClick={() => setReviewing(r)}>
              Review
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setViewing(r)}>
            History
          </Button>
        </div>
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

      <Dialog open={!!reviewing} onOpenChange={(open) => { if (!open) { setReviewing(null); setRejectComment(''); } }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Reported Hours</DialogTitle>
            <DialogDescription>
              {reviewing && (() => {
                const p = getProcessById(reviewing.process_id);
                const applicantName = p ? getApplicantById(p.applicant_id)?.display_name : undefined;
                return `${applicantName || 'Unknown'} — ${reviewing.month} — ${reviewing.total_hours}h total`;
              })()}
            </DialogDescription>
          </DialogHeader>

          {reviewing && (
            <div className="grid grid-cols-4 gap-2">
              {reviewing.days.map((d) => (
                <div key={d.date} className="text-center bg-gray-50 rounded-lg py-2">
                  <p className="text-xs text-muted-foreground">
                    {new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-sm font-semibold text-foreground">{d.hours}h</p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Comment (required if rejecting)</label>
            <Textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="e.g. Add the hours missing on Tuesday"
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="gap-1.5 border-red-200 text-red-700 hover:bg-red-50"
              onClick={() => handleReview('rejected')}
              disabled={submitting}
            >
              <CircleX className="w-4 h-4" />
              Reject
            </Button>
            <Button
              className="gap-1.5"
              onClick={() => handleReview('approved')}
              disabled={submitting}
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
