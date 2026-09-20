'use client';

import { useState, useMemo, useCallback } from 'react';
import { GitBranch, Hourglass, FileSignature, Eye } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data-context';
import { Button } from '@/components/ui/button';
import { ProcessTimeline } from '@/components/process-timeline';
import { ProcessStatusBadge } from '@/components/process-status-badge';
import { ContractSigningModal } from '@/components/contract-signing-modal';
import type { SelectionProcess } from '@/types';
import { useT } from '@/lib/i18n';

type FilterType = 'all' | 'active' | 'completed';

export default function ApplicantProcessesPage() {
  const { t, lang, formatDate } = useT();
  const isEs = lang === 'es';
  const { currentUser } = useAuth();
  const { selectionProcesses, interviewRequests, talentProfiles, employerProfiles, signContract } = useData();
  const user = currentUser;
  const [contractSignProcess, setContractSignProcess] = useState<SelectionProcess | null>(null);

  const talentProfile = useMemo(function () {
    if (user?.talent_profile_id) {
      const found = talentProfiles.find(function (t) { return t.id === user.talent_profile_id; });
      if (found) return found;
    }
    if (user?.profile_id) {
      const found = talentProfiles.find(function (t) { return t.user_id === user.profile_id; });
      if (found) return found;
    }
    return null;
  }, [user, talentProfiles]);

  const processes = useMemo(function () {
    if (!talentProfile) return [];
    return selectionProcesses.filter(function (p) { return p.applicant_id === talentProfile.id; });
  }, [talentProfile, selectionProcesses]);

  const hasPendingForProcess = useCallback(
    (employerId: string) => interviewRequests.some(
      function (r) { return r.applicant_id === talentProfile?.id && r.employer_id === employerId && r.status === 'pending'; }
    ),
    [talentProfile, interviewRequests]
  );

  const [filter, setFilter] = useState<FilterType>('all');

  const filteredProcesses = useMemo(function () {
    if (filter === 'all') return processes;
    if (filter === 'active') {
      return processes.filter(function (p) { return p.status === 'active'; });
    }
    return processes.filter(function (p) {
      return p.status === 'on_hold' || p.status === 'hired' || p.status === 'not_selected';
    });
  }, [processes, filter]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">{isEs ? 'Por favor inicia sesión' : 'Please sign in'}</h2>
          <p className="text-muted-foreground">{isEs ? 'Inicia sesión con una cuenta de aplicante para ver tus procesos.' : 'Sign in with an applicant account to view your processes.'}</p>
        </div>
      </div>
    );
  }

  var filterOptions: { key: FilterType; label: string }[] = [
    { key: 'all', label: isEs ? 'Todos' : 'All' },
    { key: 'active', label: isEs ? 'Activos' : 'Active' },
    { key: 'completed', label: isEs ? 'Completados' : 'Completed' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t.applicant.processesTitle}</h2>
        <p className="text-muted-foreground mt-1">
          {isEs ? 'Sigue el progreso de tus procesos de selección con las empresas.' : 'Track the progress of your hiring processes with employers.'}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {filterOptions.map(function (option) {
          var isActive = filter === option.key;
          return (
            <Button
              key={option.key}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={function () { setFilter(option.key); }}
            >
              {option.label}
            </Button>
          );
        })}
      </div>

      {filteredProcesses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center mx-auto mb-4">
            <GitBranch className="w-7 h-7 text-[hsl(210,100%,45%)]" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">{isEs ? 'No se encontraron procesos' : 'No processes found'}</h3>
          <p className="text-sm text-muted-foreground">
            {filter === 'all'
              ? (isEs ? 'Cuando formes parte de un proceso de selección, aparecerá aquí.' : 'When you are part of a selection process, it will appear here.')
              : (isEs ? 'Ningún proceso coincide con el filtro seleccionado.' : 'No processes match the selected filter.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredProcesses.map(function (process) {
            var employer = employerProfiles.find(function (e) {
              return e.id === process.employer_id;
            });

            return (
              <div
                key={process.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                  <div className="flex items-center justify-between mb-5">
                  <div>
                    <h4 className="font-semibold text-foreground text-lg">{process.role_title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {employer?.company_name || (isEs ? 'Empresa Desconocida' : 'Unknown Company')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasPendingForProcess(process.employer_id) && (
                      <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full" title={isEs ? 'Esperando tu respuesta' : 'Awaiting your response'}>
                        <Hourglass className="w-3.5 h-3.5" />
                        {isEs ? 'Pendiente' : 'Pending'}
                      </span>
                    )}
                    <ProcessStatusBadge status={process.status} />
                  </div>
                </div>

                <ProcessTimeline
                  currentStage={process.current_stage}
                  status={process.status}
                  introDate={process.intro_interview_date}
                  technicalDate={process.technical_interview_date}
                  contractStatus={process.contract_status}
                  meetingUrl={process.meeting_url}
                />

                {process.current_stage === 'contract_signing' && process.contract_status === 'pending' && (
                  <div className="mt-4">
                    <Button
                      onClick={() => setContractSignProcess(process)}
                      className="w-full gap-2"
                      variant="default"
                    >
                      <FileSignature className="w-4 h-4" />
                      {isEs ? 'Ver Contrato y Firmar' : 'View Contract & Sign'}
                    </Button>
                  </div>
                )}

                {process.current_stage === 'contract_signing' && process.contract_status === 'under_review' && (
                  <div className="mt-4 flex items-center gap-2 bg-blue-50 rounded-xl px-4 py-3 text-sm text-blue-700">
                    <Eye className="w-4 h-4 shrink-0" />
                    {isEs ? 'Tu firma ha sido enviada. Esperando verificación del administrador.' : 'Your signature has been submitted. Waiting for admin verification.'}
                  </div>
                )}

                {process.current_stage === 'contract_signing' && process.contract_status === 'signed' && process.contract_url && (
                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => window.open(process.contract_url!, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                      {isEs ? 'Ver Contrato Final' : 'View Final Contract'}
                    </Button>
                    <span className="text-xs text-emerald-600 font-medium">{isEs ? 'Firmado y Finalizado' : 'Signed & Finalized'}</span>
                  </div>
                )}

                {process.notes && (
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{isEs ? 'Notas:' : 'Notes:'}</span> {process.notes}
                    </p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-3">
                  {isEs ? 'Iniciado el ' : 'Started '}
                  {formatDate(process.created_at, {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </p>
                {process.status === 'hired' && process.contract_start_date && (
                  <p className="text-xs text-muted-foreground">
                    {isEs ? 'Trabajando desde el ' : 'Working since '}
                    {formatDate(process.contract_start_date + 'T00:00:00', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {process.contract_end_date && (
                      <>{isEs ? ' · Termina el ' : ' · Ends '}{formatDate(process.contract_end_date + 'T00:00:00', { month: 'short', day: 'numeric', year: 'numeric' })}</>
                    )}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ContractSigningModal
        open={!!contractSignProcess}
        onClose={() => setContractSignProcess(null)}
        process={contractSignProcess}
        onSign={signContract}
      />
    </div>
  );
}
