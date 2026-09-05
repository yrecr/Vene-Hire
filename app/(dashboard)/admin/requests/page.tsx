'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { RoleBadge } from '@/components/role-badge';
import { Button } from '@/components/ui/button';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { useData } from '@/lib/data-context';
import type { AccessRequest } from '@/types';
import { Eye, CircleCheck, CircleX } from 'lucide-react';

const statusTabs = ['All', 'Pending', 'Contacted', 'Approved', 'Rejected'] as const;
const typeTabs = ['All', 'Applicant Requests', 'Employer Requests'] as const;
const UNDO_WINDOW_MS = 6000;

export default function AccessRequestsPage() {
  const {
    accessRequests, setAccessRequests, updateAccessRequestStatus,
    setProfiles, profiles, isHydrated,
  } = useData();
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('All');
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('All');
  const [viewing, setViewing] = useState<AccessRequest | null>(null);
  const { toast } = useToast();
  const pendingTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const timers = pendingTimers.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  const commitApproval = useCallback((req: AccessRequest) => {
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
    setAccessRequests((prev) => prev.map((r) => (r.id === req.id ? { ...r, status } : r)));

    const undo = () => {
      clearTimeout(pendingTimers.current[req.id]);
      delete pendingTimers.current[req.id];
      setAccessRequests((prev) => prev.map((r) => (r.id === req.id ? { ...r, status: 'pending' } : r)));
    };

    toast({
      title: status === 'approved' ? 'Request approved' : 'Request rejected',
      description: `${req.full_name} — this takes effect in a few seconds.`,
      action: (
        <ToastAction altText="Undo" onClick={undo}>
          Undo
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
  }, [setAccessRequests, updateAccessRequestStatus, commitApproval, toast]);

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

  const columns: DataTableColumn<AccessRequest>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (item) => <span className="font-medium text-foreground">{item.full_name}</span>,
    },
    {
      key: 'request_type',
      header: 'Type',
      render: (item) => <RoleBadge role={item.request_type} />,
    },
    {
      key: 'company',
      header: 'Company',
      render: (item) => <span className="text-muted-foreground">{item.company || '-'}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (item) => <span className="text-muted-foreground">{item.email}</span>,
    },
    {
      key: 'role',
      header: 'Role / Need',
      render: (item) => <span className="text-muted-foreground">{item.hiring_need}</span>,
    },
    {
      key: 'candidate',
      header: 'Candidate',
      render: (item) => (
        <span className="text-muted-foreground">
          {item.candidate_slug || 'General'}
        </span>
      ),
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
              {item.status === 'approved' ? 'Approved' : 'Rejected'}
            </span>
          )}
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
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-foreground">Access Requests</h2>
        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-[hsl(210,100%,45%)]/10 text-[hsl(210,100%,45%)] border border-[hsl(210,100%,45%)]/20">
          {accessRequests.length}
        </span>
      </div>

      {/* Type Filter Tabs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {typeTabs.map((tab) => (
            <Button
              key={tab}
              variant={activeTypeFilter === tab ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTypeFilter(tab)}
              className="rounded-full"
            >
              {tab}
            </Button>
          ))}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {statusTabs.map((tab) => (
            <Button
              key={tab}
              variant={activeStatusFilter === tab ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveStatusFilter(tab)}
              className="rounded-full"
            >
              {tab}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filteredRequests} pageSize={10} emptyMessage="No access requests match these filters." />

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
                  <span className="text-muted-foreground">Type</span>
                  <RoleBadge role={viewing.request_type} />
                </div>
                {viewing.company && (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Company</span>
                    <span className="text-foreground">{viewing.company}</span>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Country</span>
                  <span className="text-foreground">{viewing.country || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Role / Need</span>
                  <span className="text-foreground text-right">{viewing.hiring_need || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Candidate of interest</span>
                  <span className="text-foreground">{viewing.candidate_slug || 'General'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Status</span>
                  <RoleBadge role={viewing.status} />
                </div>
                {viewing.message && (
                  <div>
                    <p className="text-muted-foreground mb-1">Message</p>
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
