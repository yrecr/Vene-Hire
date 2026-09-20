'use client';

import { useState, useMemo } from 'react';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { PageLoading } from '@/components/page-loading';
import { ProcessStatusBadge } from '@/components/process-status-badge';
import { Button } from '@/components/ui/button';
import { useData } from '@/lib/data-context';
import { useT } from '@/lib/i18n';
import type { SelectionProcess } from '@/types';
import { Eye, Check, X, CheckCircle } from 'lucide-react';

export default function ProcessesPage() {
  const { t } = useT();
  const { selectionProcesses, verifyContract, getApplicantById, getEmployerById, contractApprovalRequests, approveContractRequest, rejectContractRequest, isHydrated } = useData();
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const filterTabs = useMemo(() => [
    { id: 'All', label: t.admin.tabAll },
    { id: 'active', label: t.badges.active },
    { id: 'hired', label: t.badges.hired },
    { id: 'on_hold', label: t.badges.on_hold },
    { id: 'not_selected', label: t.badges.not_selected },
  ], [t]);

  const filteredProcesses = useMemo(() => {
    if (activeFilter === 'All') return selectionProcesses;
    return selectionProcesses.filter((p) => p.status === activeFilter);
  }, [activeFilter, selectionProcesses]);

  const columns: DataTableColumn<SelectionProcess>[] = useMemo(() => [
    {
      key: 'applicant',
      header: t.admin.colApplicant,
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
      header: t.admin.colEmployer,
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
      header: t.admin.colRoleTitle,
      render: (item) => <span className="text-muted-foreground">{item.role_title}</span>,
    },
    {
      key: 'stage',
      header: t.admin.colStage,
      render: (item) => <ProcessStatusBadge status={item.current_stage} />,
    },
    {
      key: 'status',
      header: t.admin.colStatus,
      render: (item) => <ProcessStatusBadge status={item.status} />,
    },
    {
      key: 'contract',
      header: t.admin.colContract,
      render: (item) => {
        const pendingReq = contractApprovalRequests.find((r) => r.process_id === item.id && r.status === 'pending');
        if (pendingReq) return <span className="text-xs font-medium text-amber-600">{t.admin.pendingApprovalBadge}</span>;
        const translatedStatus = item.contract_status ? (t.badges as Record<string, string>)[item.contract_status] || item.contract_status.replace('_', ' ') : '—';
        return (
          <span className={`text-xs font-medium ${item.contract_status === 'signed' ? 'text-emerald-600' : item.contract_status === 'pending' ? 'text-amber-600' : 'text-gray-400'}`}>
            {translatedStatus}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: t.admin.colActions,
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
                  {t.admin.approveRequest}
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1 text-red-600 border-red-200 hover:bg-red-50" onClick={() => rejectContractRequest(pendingReq.id, item.id)}>
                  <X className="w-3.5 h-3.5" />
                  {t.admin.rejectRequest}
                </Button>
              </>
            ) : item.contract_status === 'under_review' && item.signature_url ? (
              <>
                <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => window.open(item.signature_url!, '_blank')}>
                  <Eye className="w-3.5 h-3.5" />
                  {t.admin.viewSignatureBtn}
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => verifyContract(item.id)}>
                  <CheckCircle className="w-3.5 h-3.5" />
                  {t.admin.verifyAndFinalizeBtn}
                </Button>
              </>
            ) : null}
          </div>
        );
      },
    },
  ], [t, getApplicantById, getEmployerById, contractApprovalRequests, approveContractRequest, rejectContractRequest, verifyContract]);

  if (!isHydrated) {
    return (
      <PageLoading />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-foreground">{t.admin.processes}</h2>
        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-[hsl(210,100%,45%)]/10 text-[hsl(210,100%,45%)] border border-[hsl(210,100%,45%)]/20">
          {selectionProcesses.length}
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {filterTabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeFilter === tab.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter(tab.id)}
            className="rounded-full"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filteredProcesses} pageSize={10} emptyMessage={t.admin.noProcessesMatch} />
    </div>
  );
}
