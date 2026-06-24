'use client';

import { useState, useMemo } from 'react';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { ProcessStatusBadge } from '@/components/process-status-badge';
import { Button } from '@/components/ui/button';
import { useMockData } from '@/lib/data-context';
import type { SelectionProcess } from '@/types';
import { Eye, Upload } from 'lucide-react';

const filterTabs = ['All', 'Active', 'Hired', 'On Hold', 'Not Selected'] as const;

const statusMap: Record<string, string> = {
  Active: 'active',
  Hired: 'hired',
  'On Hold': 'on_hold',
  'Not Selected': 'not_selected',
};

export default function ProcessesPage() {
  const { selectionProcesses, uploadContract, getApplicantById, getEmployerById } = useMockData();
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const filteredProcesses = useMemo(() => {
    if (activeFilter === 'All') return selectionProcesses;
    const statusValue = statusMap[activeFilter];
    return selectionProcesses.filter((p) => p.status === statusValue);
  }, [activeFilter, selectionProcesses]);

  const columns: DataTableColumn<SelectionProcess>[] = [
    {
      key: 'applicant',
      header: 'Applicant',
      render: (item) => {
        const applicant = getApplicantById(item.applicant_id);
        return (
          <span className="font-medium text-foreground">
            {applicant ? applicant.display_name : item.applicant_id}
          </span>
        );
      },
    },
    {
      key: 'employer',
      header: 'Employer',
      render: (item) => {
        const employer = getEmployerById(item.employer_id);
        return (
          <span className="text-muted-foreground">
            {employer ? employer.company_name : item.employer_id}
          </span>
        );
      },
    },
    {
      key: 'role',
      header: 'Role Title',
      render: (item) => <span className="text-muted-foreground">{item.role_title}</span>,
    },
    {
      key: 'stage',
      header: 'Stage',
      render: (item) => <ProcessStatusBadge status={item.current_stage} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <ProcessStatusBadge status={item.status} />,
    },
    {
      key: 'contract',
      header: 'Contract',
      render: (item) => (
        <span className={`text-xs font-medium ${item.contract_status === 'signed' ? 'text-emerald-600' : item.contract_status === 'pending' ? 'text-amber-600' : 'text-gray-400'}`}>
          {item.contract_status ? item.contract_status.replace('_', ' ') : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Eye className="w-4 h-4" />
          </Button>
          {item.contract_status === 'pending' && (
            <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => uploadContract(item.id)}>
              <Upload className="w-3.5 h-3.5" />
              Upload
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-foreground">Selection Processes</h2>
        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-[hsl(210,100%,45%)]/10 text-[hsl(210,100%,45%)] border border-[hsl(210,100%,45%)]/20">
          {selectionProcesses.length}
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {filterTabs.map((tab) => (
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

      {/* Table */}
      <DataTable columns={columns} data={filteredProcesses} />
    </div>
  );
}
