'use client';

import { useState, useMemo } from 'react';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { RoleBadge } from '@/components/role-badge';
import { Button } from '@/components/ui/button';
import { mockAccessRequests } from '@/data/mock';
import type { AccessRequest } from '@/types';
import { Eye, CircleCheck, CircleX } from 'lucide-react';

const statusTabs = ['All', 'Pending', 'Contacted', 'Approved', 'Rejected'] as const;
const typeTabs = ['All', 'Applicant Requests', 'Employer Requests'] as const;

export default function AccessRequestsPage() {
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('All');
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('All');

  const filteredRequests = useMemo(() => {
    let result = mockAccessRequests;

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
  }, [activeStatusFilter, activeTypeFilter]);

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
      render: () => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700">
            <CircleCheck className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600">
            <CircleX className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-foreground">Access Requests</h2>
        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-[hsl(210,100%,45%)]/10 text-[hsl(210,100%,45%)] border border-[hsl(210,100%,45%)]/20">
          {mockAccessRequests.length}
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
