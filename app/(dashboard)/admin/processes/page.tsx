'use client';

import { useState, useMemo } from 'react';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { ProcessStatusBadge } from '@/components/process-status-badge';
import { Button } from '@/components/ui/button';
import { useData } from '@/lib/data-context';
import type { SelectionProcess } from '@/types';
import { Eye, Upload, Check, X, FileSignature, CheckCircle } from 'lucide-react';

const filterTabs = ['All', 'Active', 'Hired', 'On Hold', 'Not Selected'] as const;

const statusMap: Record<string, string> = {
  Active: 'active',
  Hired: 'hired',
  'On Hold': 'on_hold',
  'Not Selected': 'not_selected',
};

export default function ProcessesPage() {
  const { selectionProcesses, uploadContract, verifyContract, getApplicantById, getEmployerById, contractApprovalRequests, approveContractRequest, rejectContractRequest, isHydrated } = useData();
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
      render: (item) => {
        const pendingReq = contractApprovalRequests.find((r) => r.process_id === item.id && r.status === 'pending');
        if (pendingReq) return <span className="text-xs font-medium text-amber-600">Pending Approval</span>;
        return (
          <span className={`text-xs font-medium ${item.contract_status === 'signed' ? 'text-emerald-600' : item.contract_status === 'pending' ? 'text-amber-600' : 'text-gray-400'}`}>
            {item.contract_status ? item.contract_status.replace('_', ' ') : '—'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => {
        const pendingReq = contractApprovalRequests.find((r) => r.process_id === item.id && r.status === 'pending');
        return (
          <div className="flex gap-1">
            {item.contract_url && (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => window.open(item.contract_url!, '_blank')}>
                <Eye className="w-4 h-4" />
              </Button>
            )}
            {pendingReq ? (
              <>
                <Button variant="outline" size="sm" className="h-8 gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => approveContractRequest(pendingReq.id, item.id)}>
                  <Check className="w-3.5 h-3.5" />
                  Approve
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1 text-red-600 border-red-200 hover:bg-red-50" onClick={() => rejectContractRequest(pendingReq.id, item.id)}>
                  <X className="w-3.5 h-3.5" />
                  Reject
                </Button>
              </>
            ) : item.contract_status === 'under_review' && item.signature_url ? (
              <>
                <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => window.open(item.signature_url!, '_blank')}>
                  <Eye className="w-3.5 h-3.5" />
                  View Signature
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => verifyContract(item.id)}>
                  <CheckCircle className="w-3.5 h-3.5" />
                  Verify &amp; Finalize
                </Button>
              </>
            ) : null}
          </div>
        );
      },
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
      <DataTable columns={columns} data={filteredProcesses} pageSize={10} emptyMessage="No selection processes match these filters." />
    </div>
  );
}
