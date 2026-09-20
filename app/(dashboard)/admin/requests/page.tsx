'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { PageLoading } from '@/components/page-loading';
import { RoleBadge } from '@/components/role-badge';
import { Button } from '@/components/ui/button';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { useData } from '@/lib/data-context';
import { useT } from '@/lib/i18n';
import type { AccessRequest } from '@/types';
import { Eye, CircleCheck, CircleX } from 'lucide-react';
import { demoGuard, isDemoMode } from '@/lib/demo';

const UNDO_WINDOW_MS = 6000;

export default function AccessRequestsPage() {
  const { t, formatDate } = useT();
  const {
    accessRequests, setAccessRequests, updateAccessRequestStatus,
    setProfiles, profiles, isHydrated,
  } = useData();
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('All');
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('All');
  const [viewing, setViewing] = useState<AccessRequest | null>(null);
  const { toast } = useToast();
  const pendingTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const typeTabs = useMemo(() => [
    { id: 'All', label: t.admin.tabAll },
    { id: 'Applicant Requests', label: t.admin.tabApplicantRequests },
    { id: 'Employer Requests', label: t.admin.tabEmployerRequests },
  ], [t]);

  const statusTabs = useMemo(() => [
    { id: 'All', label: t.admin.tabAll },
    { id: 'Pending', label: t.admin.tabPending },
    { id: 'Contacted', label: t.admin.tabContacted },
    { id: 'Approved', label: t.admin.tabApproved },
    { id: 'Rejected', label: t.admin.tabRejected },
  ], [t]);

  useEffect(() => {
    const timers = pendingTimers.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  const commitApproval = useCallback((req: AccessRequest) => {
    if (isDemoMode()) return;
    fetch('/api/approve-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: req.email,
        full_name: req.full_name,
        company: req.company,
        request_type: req.request_type,
        hiring_need: req.hiring_need,
        access_request_id: req.id,
      }),
    }).catch(() => {});

    if (!profiles.some((p) => p.email === req.email)) {
      const now = Date.now();
      setProfiles([...profiles, {
        id: `p-${now}`,
        auth_user_id: `auth-${now}`,
        full_name: req.full_name,
        email: req.email,
        role: req.request_type === 'employer' ? 'employer' : 'applicant',
        company_name: req.company || null,
        status: 'active',
        created_at: new Date().toISOString(),
      }]);
    }
  }, [profiles, setProfiles]);

  const decide = useCallback((req: AccessRequest, status: 'approved' | 'rejected') => {
    if (demoGuard(`${status} request`)) return;
    setAccessRequests((prev) => prev.map((r) => (r.id === req.id ? { ...r, status } : r)));

    const undo = () => {
      clearTimeout(pendingTimers.current[req.id]);
      delete pendingTimers.current[req.id];
      setAccessRequests((prev) => prev.map((r) => (r.id === req.id ? { ...r, status: 'pending' } : r)));
    };

    toast({
      title: status === 'approved' ? t.admin.requestApprovedToast : t.admin.requestRejectedToast,
      description: t.admin.requestTakesEffect.replace('{name}', req.full_name),
      action: (
        <ToastAction altText={t.admin.undoBtn} onClick={undo}>
          {t.admin.undoBtn}
        </ToastAction>
      ),
    });

    pendingTimers.current[req.id] = setTimeout(() => {
      delete pendingTimers.current[req.id];
      updateAccessRequestStatus(req.id, status);
      if (status === 'approved') {
        commitApproval(req);
      }
    }, UNDO_WINDOW_MS);
  }, [setAccessRequests, updateAccessRequestStatus, commitApproval, toast, t]);

  const filteredRequests = useMemo(() => {
    let result = accessRequests;

    if (activeTypeFilter === 'Applicant Requests') {
      result = result.filter((r) => r.request_type === 'applicant');
    } else if (activeTypeFilter === 'Employer Requests') {
      result = result.filter((r) => r.request_type === 'employer');
    }

    if (activeStatusFilter !== 'All') {
      result = result.filter(
        (r) => r.status === activeStatusFilter.toLowerCase()
      );
    }

    return result;
  }, [accessRequests, activeStatusFilter, activeTypeFilter]);

  const columns: DataTableColumn<AccessRequest>[] = useMemo(() => [
    {
      key: 'name',
      header: t.admin.colName,
      render: (item) => <span className="font-medium text-foreground">{item.full_name}</span>,
    },
    {
      key: 'request_type',
      header: t.admin.colRole,
      render: (item) => <RoleBadge role={item.request_type} />,
    },
    {
      key: 'company',
      header: t.admin.colCompany,
      render: (item) => <span className="text-muted-foreground">{item.company || '-'}</span>,
    },
    {
      key: 'email',
      header: t.admin.colEmail,
      render: (item) => <span className="text-muted-foreground">{item.email}</span>,
    },
    {
      key: 'role',
      header: t.admin.colRoleNeed,
      render: (item) => <span className="text-muted-foreground">{item.hiring_need}</span>,
    },
    {
      key: 'candidate',
      header: t.admin.colCandidate,
      render: (item) => (
        <span className="text-muted-foreground">
          {item.candidate_slug || t.admin.generalCandidate}
        </span>
      ),
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
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t.admin.colActions,
      render: (item) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setViewing(item)}>
            <Eye className="w-4 h-4" />
          </Button>
          {item.status === 'pending' ? (
            <>
              <Button
                variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700"
                onClick={() => decide(item, 'approved')}
              >
                <CircleCheck className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                onClick={() => decide(item, 'rejected')}
              >
                <CircleX className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <span className="text-xs text-muted-foreground italic">
              {item.status === 'approved' ? t.admin.tabApproved : t.admin.tabRejected}
            </span>
          )}
        </div>
      ),
    },
  ], [t, formatDate, decide]);

  if (!isHydrated) {
    return (
      <PageLoading />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-foreground">{t.admin.accessRequests}</h2>
        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-[hsl(210,100%,45%)]/10 text-[hsl(210,100%,45%)] border border-[hsl(210,100%,45%)]/20">
          {accessRequests.length}
        </span>
      </div>

      {/* Type Filter Tabs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {typeTabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTypeFilter === tab.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTypeFilter(tab.id)}
              className="rounded-full"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {statusTabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeStatusFilter === tab.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveStatusFilter(tab.id)}
              className="rounded-full"
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filteredRequests} pageSize={10} emptyMessage={t.admin.noRequestsMatch} />

      {/* Detail dialog */}
      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent>
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle>{viewing.full_name}</DialogTitle>
                <DialogDescription>{viewing.email}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">{t.admin.colRole}</span>
                  <RoleBadge role={viewing.request_type} />
                </div>
                {viewing.company && (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">{t.admin.colCompany}</span>
                    <span className="text-foreground">{viewing.company}</span>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">{t.admin.countryLabel}</span>
                  <span className="text-foreground">{viewing.country || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">{t.admin.colRoleNeed}</span>
                  <span className="text-foreground text-right">{viewing.hiring_need || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">{t.admin.candidateOfInterest}</span>
                  <span className="text-foreground">{viewing.candidate_slug || t.admin.generalCandidate}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">{t.admin.colStatus}</span>
                  <RoleBadge role={viewing.status} />
                </div>
                {viewing.message && (
                  <div>
                    <p className="text-muted-foreground mb-1">{t.admin.messageLabel}</p>
                    <p className="text-foreground bg-gray-50 rounded-lg p-3 leading-relaxed">
                      {viewing.message}
                    </p>
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
