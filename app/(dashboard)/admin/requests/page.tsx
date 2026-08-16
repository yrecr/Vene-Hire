'use client';

import { useState, useMemo, useCallback } from 'react';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { RoleBadge } from '@/components/role-badge';
import { Button } from '@/components/ui/button';
import { useData } from '@/lib/data-context';
import type { AccessRequest } from '@/types';
import { Eye, CircleCheck, CircleX } from 'lucide-react';

const statusTabs = ['All', 'Pending', 'Contacted', 'Approved', 'Rejected'] as const;
const typeTabs = ['All', 'Applicant Requests', 'Employer Requests'] as const;

export default function AccessRequestsPage() {
  const { accessRequests, setAccessRequests, setProfiles, profiles, employerProfiles } = useData();
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('All');
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('All');

  const updateStatus = useCallback((id: string, status: AccessRequest['status']) => {
    const req = accessRequests.find((r) => r.id === id);
    if (status === 'approved' && req) {
      fetch('/api/approve-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: req.email,
          full_name: req.full_name,
          company: req.company,
          request_type: req.request_type,
          hiring_need: req.hiring_need,
          access_request_id: id,
        }),
      }).catch(() => {});
    }

    setAccessRequests((prev) => {
      const r = prev.find((x) => x.id === id);
      const next = prev.map((x) => x.id === id ? { ...x, status } : x);

      if (status === 'approved' && r) {
        const now = Date.now();
        const profileId = `p-${now}`;
        const newProfiles = [...profiles];
        if (!newProfiles.some((p) => p.email === r.email)) {
          newProfiles.push({
            id: profileId,
            auth_user_id: `auth-${now}`,
            full_name: r.full_name,
            email: r.email,
            role: r.request_type === 'employer' ? 'employer' : 'applicant',
            company_name: r.company || null,
            status: 'active',
            created_at: new Date().toISOString(),
          });
        }
        setProfiles(newProfiles);

        if (r.request_type === 'employer') {
          const newEmployers = [...employerProfiles];
          if (!newEmployers.some((e) => e.user_id === profileId)) {
            newEmployers.push({
              id: `emp-${now}`,
              user_id: profileId,
              company_name: r.company || r.full_name,
              contact_name: r.full_name,
              summary: `Approved demo request for ${r.company || r.full_name}.`,
              hiring_needs: r.hiring_need || 'Not specified',
              status: 'active',
              created_at: new Date().toISOString(),
            });
          }
        }
      }

      return next;
    });
  }, [accessRequests, profiles, employerProfiles, setAccessRequests, setProfiles]);

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
          {item.status === 'pending' ? (
            <>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700"
                onClick={() => updateStatus(item.id, 'approved')}
              >
                <CircleCheck className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                onClick={() => updateStatus(item.id, 'rejected')}
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-foreground">Access Requests</h2>
        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
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
      <DataTable columns={columns} data={filteredRequests} />
    </div>
  );
}
