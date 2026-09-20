'use client';

import { useState, useMemo, useCallback } from 'react';
import { GitBranch, Calendar as CalendarIcon, Clock, Globe, FileSignature, Hourglass, Eye, DollarSign, Pencil, Check, ClipboardCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ProcessTimeline } from '@/components/process-timeline';
import { ProfileAvatar } from '@/components/profile-avatar';
import { ProcessStatusBadge } from '@/components/process-status-badge';
import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data-context';
import type { SelectionProcess } from '@/types';
import { format } from 'date-fns';
import { useT } from '@/lib/i18n';

type FilterTabKey = 'all' | 'active' | 'hired' | 'on_hold' | 'not_selected';

function tabToStatus(tabKey: FilterTabKey): string | null {
  if (tabKey === 'all') return null;
  return tabKey;
}

export default function EmployerProcessesPage() {
  const { currentUser } = useAuth();
  const {
    selectionProcesses,
    interviewRequests,
    setProcessStage,
    updateProcessStatus,
    updateProcessHourlyRate,
    updateProcessContractEndDate,
    getApplicantById,
    getAvailabilityForApplicant,
    requestContractApproval,
    contractApprovalRequests,
    employerProfiles,
    timesheets,
  } = useData();
  const { t, lang, formatDate, formatCurrency } = useT();

  const filterTabs: { key: FilterTabKey; label: string }[] = useMemo(
    () => [
      { key: 'all', label: t.common.all },
      { key: 'active', label: t.badges.active },
      { key: 'hired', label: t.badges.hired },
      { key: 'on_hold', label: t.badges.on_hold },
      { key: 'not_selected', label: t.badges.not_selected },
    ],
    [t]
  );

  const dayNames = useMemo(
    () =>
      lang === 'es'
        ? ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
        : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    [lang]
  );

  const [activeTab, setActiveTab] = useState<FilterTabKey>('all');
  const [schedulingProcess, setSchedulingProcess] = useState<SelectionProcess | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [contractProcess, setContractProcess] = useState<SelectionProcess | null>(null);
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [rateInput, setRateInput] = useState('');
  const [editingEndDateId, setEditingEndDateId] = useState<string | null>(null);
  const [endDateInput, setEndDateInput] = useState('');

  const schedulingApplicant = schedulingProcess ? getApplicantById(schedulingProcess.applicant_id) : null;
  const schedulingSlots = schedulingApplicant
    ? getAvailabilityForApplicant(schedulingApplicant.id)
    : [];
  const schedulingTimezone = schedulingApplicant?.timezone || 'America/Bogota';

  const slotsForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    const dayOfWeek = selectedDate.getDay();
    return schedulingSlots.filter((s) => (s.day_of_week % 7) === dayOfWeek);
  }, [selectedDate, schedulingSlots]);

  const employerProfile = currentUser?.employer_profile_id
    ? employerProfiles.find((e) => e.id === currentUser.employer_profile_id)
    : undefined;

  const employerId = employerProfile?.id ?? '';

  const processes = useMemo(
    () => selectionProcesses.filter((p) => p.employer_id === employerId),
    [selectionProcesses, employerId]
  );

  const filteredProcesses = useMemo(() => {
    const statusFilter = tabToStatus(activeTab);
    if (!statusFilter) return processes;
    return processes.filter((p) => p.status === statusFilter);
  }, [processes, activeTab]);

  const hasApprovalPending = useCallback(
    (process: SelectionProcess) =>
      contractApprovalRequests.some((r) => r.process_id === process.id && r.status === 'pending'),
    [contractApprovalRequests]
  );

  const hasPendingForProcess = useCallback(
    (process: SelectionProcess) =>
      interviewRequests.some(
        (r) =>
          r.applicant_id === process.applicant_id &&
          r.employer_id === process.employer_id &&
          r.status === 'pending' &&
          r.role_title === `Technical Interview - ${process.role_title}`
      ),
    [interviewRequests]
  );

  const latestTimesheetFor = useCallback(
    (process: SelectionProcess) =>
      timesheets.find(
        (item) => item.process_id === process.id && (item.status === 'submitted' || item.status === 'approved')
      ),
    [timesheets]
  );

  const handleStageClick = useCallback(
    (process: SelectionProcess, stageKey: string) => {
      if (
        stageKey === 'technical_interview' &&
        interviewRequests.some(
          (r) =>
            r.applicant_id === process.applicant_id &&
            r.employer_id === process.employer_id &&
            r.status === 'pending' &&
            r.role_title === `Technical Interview - ${process.role_title}`
        )
      )
        return;
      if (stageKey === 'contract_signing') {
        setContractProcess(process);
      } else {
        setSchedulingProcess(process);
        setSelectedDate(undefined);
        setSelectedTimeSlot('');
      }
    },
    [interviewRequests]
  );

  const handleInitiateContract = useCallback(() => {
    if (!contractProcess) return;
    requestContractApproval(contractProcess.id);
    setContractProcess(null);
  }, [contractProcess, requestContractApproval]);

  const handleSchedule = useCallback(() => {
    if (!schedulingProcess || !selectedDate || !selectedTimeSlot) return;
    const [startTime] = selectedTimeSlot.split(' - ');
    const dateStr = `${format(selectedDate, 'yyyy-MM-dd')}T${startTime}:00`;
    setProcessStage(schedulingProcess.id, 'technical_interview', dateStr);
    setSchedulingProcess(null);
    setSelectedDate(undefined);
    setSelectedTimeSlot('');
  }, [schedulingProcess, selectedDate, selectedTimeSlot, setProcessStage]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t.employer.processesTitle}</h2>
        <p className="text-muted-foreground mt-1">
          {lang === 'es'
            ? 'Monitorea y administra tus procesos de contratación activos.'
            : 'Track and manage your active hiring pipelines.'}
        </p>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredProcesses.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title={t.common.noResults}
          description={
            activeTab === 'all'
              ? lang === 'es'
                ? 'Aún no tienes procesos de selección. Comienza explorando candidatos y enviando solicitudes de entrevista.'
                : 'You have no selection processes yet. Start by browsing applicants and sending interview requests.'
              : lang === 'es'
              ? 'No hay procesos con el estado seleccionado.'
              : 'No processes with the selected status.'
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredProcesses.map((process) => {
            const applicant = getApplicantById(process.applicant_id);
            return (
              <div
                key={process.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {applicant && (
                      <ProfileAvatar
                        src={applicant.profile_image_url}
                        name={applicant.display_name}
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {applicant?.display_name || 'Unknown Applicant'}
                      </h3>
                      <p className="text-sm text-muted-foreground">{process.role_title}</p>
                    </div>
                  </div>
                  <ProcessStatusBadge status={process.status} />
                </div>

                {process.status !== 'hired' && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-xs text-muted-foreground mr-1">
                      {lang === 'es' ? 'Cambiar estado:' : 'Set status:'}
                    </span>
                    {(['active', 'on_hold', 'not_selected'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => updateProcessStatus(process.id, s)}
                        disabled={process.status === s}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                          process.status === s
                            ? 'bg-gray-100 text-gray-500 border-gray-100 cursor-default'
                            : 'bg-white text-muted-foreground border-gray-200 hover:border-[hsl(210,100%,45%)] hover:text-[hsl(210,100%,45%)]'
                        }`}
                      >
                        {(t.badges as Record<string, string>)[s] || s}
                      </button>
                    ))}
                  </div>
                )}

                {process.status === 'hired' && (
                  <div className="flex items-center gap-2 mb-3 text-sm">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    {editingRateId === process.id ? (
                      <>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={rateInput}
                          onChange={(e) => setRateInput(e.target.value)}
                          placeholder="Hourly rate (USD)"
                          className="h-8 w-36 text-sm"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            const rate = parseFloat(rateInput);
                            if (!isNaN(rate) && rate >= 0) updateProcessHourlyRate(process.id, rate);
                            setEditingRateId(null);
                          }}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="text-muted-foreground">
                          {lang === 'es' ? 'Tarifa horaria:' : 'Hourly rate:'}{' '}
                          <span className="font-medium text-foreground">
                            {process.hourly_rate != null
                              ? `${formatCurrency(process.hourly_rate)}/hr`
                              : lang === 'es'
                              ? 'No asignada'
                              : 'Not set'}
                          </span>
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setEditingRateId(process.id);
                            setRateInput(process.hourly_rate != null ? String(process.hourly_rate) : '');
                          }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {process.status === 'hired' && (
                  <div className="flex items-center gap-2 mb-3 text-sm">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {lang === 'es' ? 'Trabajando desde' : 'Working since'}{' '}
                      <span className="font-medium text-foreground">
                        {process.contract_start_date
                          ? formatDate(process.contract_start_date + 'T00:00:00')
                          : lang === 'es'
                          ? 'no definida'
                          : 'unknown'}
                      </span>
                    </span>
                    <span className="text-muted-foreground">·</span>
                    {editingEndDateId === process.id ? (
                      <>
                        <Input
                          type="date"
                          value={endDateInput}
                          onChange={(e) => setEndDateInput(e.target.value)}
                          className="h-8 w-40 text-sm"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            updateProcessContractEndDate(process.id, endDateInput || null);
                            setEditingEndDateId(null);
                          }}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="text-muted-foreground">
                          {process.contract_end_date
                            ? lang === 'es'
                              ? 'Finaliza'
                              : 'Ends'
                            : lang === 'es'
                            ? 'Sin fecha de fin'
                            : 'No end date set'}{' '}
                          {process.contract_end_date && (
                            <span className="font-medium text-foreground">
                              {formatDate(process.contract_end_date + 'T00:00:00')}
                            </span>
                          )}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setEditingEndDateId(process.id);
                            setEndDateInput(process.contract_end_date || '');
                          }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {latestTimesheetFor(process) && (
                  <div
                    className={`flex items-center justify-between gap-2 mb-3 text-sm rounded-lg px-3 py-2 ${
                      latestTimesheetFor(process)!.status === 'approved'
                        ? 'bg-emerald-50 border border-emerald-100 text-emerald-800'
                        : 'bg-blue-50 border border-blue-100 text-blue-800'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <ClipboardCheck className="w-4 h-4" />
                      {latestTimesheetFor(process)!.status === 'approved'
                        ? lang === 'es'
                          ? `Horas aprobadas de ${latestTimesheetFor(process)!.month} — ${latestTimesheetFor(process)!.total_hours}h`
                          : `Hours approved for ${latestTimesheetFor(process)!.month} — ${latestTimesheetFor(process)!.total_hours}h`
                        : lang === 'es'
                        ? `Horas enviadas de ${latestTimesheetFor(process)!.month} — en revisión del admin`
                        : `Hours submitted for ${latestTimesheetFor(process)!.month} — pending admin review`}
                    </span>
                    {latestTimesheetFor(process)!.invoice_url && (
                      <a
                        href={latestTimesheetFor(process)!.invoice_url!}
                        target="_blank"
                        rel="noreferrer"
                        className="underline font-medium flex-shrink-0"
                      >
                        {lang === 'es' ? 'Ver factura' : 'View invoice'}
                      </a>
                    )}
                  </div>
                )}

                {hasApprovalPending(process) && (
                  <div className="flex items-center gap-1.5 mb-3 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                    <Hourglass className="w-3.5 h-3.5" />
                    {lang === 'es' ? 'Esperando Aprobación del Admin' : 'Awaiting Admin Approval'}
                  </div>
                )}

                {hasPendingForProcess(process) && (
                  <div className="flex items-center gap-1.5 mb-3 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                    <Hourglass className="w-3.5 h-3.5" />
                    {lang === 'es' ? 'Esperando respuesta del candidato' : 'Awaiting candidate response'}
                  </div>
                )}

                <div className="mb-4">
                  <ProcessTimeline
                    currentStage={process.current_stage as 'intro_interview' | 'technical_interview' | 'contract_signing'}
                    status={process.status as 'active' | 'hired' | 'not_selected' | 'on_hold'}
                    introDate={process.intro_interview_date}
                    technicalDate={process.technical_interview_date}
                    contractStatus={process.contract_status as 'pending' | 'under_review' | 'signed' | null}
                    meetingUrl={process.meeting_url}
                    onStageClick={(stageKey) => handleStageClick(process, stageKey)}
                  />
                </div>

                {process.current_stage === 'contract_signing' && process.contract_status === 'signed' && process.contract_url && (
                  <div className="mb-3 flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open(process.contract_url!, '_blank')}>
                      <Eye className="w-4 h-4" />
                      {lang === 'es' ? 'Ver Contrato' : 'View Contract'}
                    </Button>
                    <span className="text-xs text-emerald-600 font-medium">
                      {lang === 'es' ? 'Finalizado' : 'Finalized'}
                    </span>
                  </div>
                )}

                {process.notes && (
                  <p className="text-sm text-muted-foreground mb-2">
                    <span className="font-medium text-foreground">{t.common.notes}:</span> {process.notes}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {lang === 'es' ? 'Iniciado el' : 'Started'}{' '}
                  {formatDate(process.created_at)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        open={!!schedulingProcess}
        onOpenChange={(open) => {
          if (!open) {
            setSchedulingProcess(null);
            setSelectedTimeSlot('');
          }
        }}
      >
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {lang === 'es' ? 'Agendar Entrevista Técnica' : 'Schedule Technical Interview'}
            </DialogTitle>
            <DialogDescription>
              {schedulingProcess && (
                <>
                  {lang === 'es'
                    ? `Selecciona fecha y hora para la entrevista técnica con ${getApplicantById(schedulingProcess.applicant_id)?.display_name || 'el candidato'} para el rol ${schedulingProcess.role_title}.`
                    : `Select a date and time slot for the technical interview with ${getApplicantById(schedulingProcess.applicant_id)?.display_name || 'the candidate'} for ${schedulingProcess.role_title}.`}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {lang === 'es' ? 'Horarios Disponibles' : 'Available Slots'} ({schedulingTimezone})
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {schedulingSlots.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  {lang === 'es' ? 'Sin horarios asignados.' : 'No availability slots set.'}
                </p>
              ) : (
                schedulingSlots.map((slot) => (
                  <Badge key={slot.id} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {dayNames[slot.day_of_week % 7]}: {slot.start_time.split(':').slice(0, 2).join(':')} - {slot.end_time.split(':').slice(0, 2).join(':')}
                  </Badge>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-center py-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(day) => {
                setSelectedDate(day);
                setSelectedTimeSlot('');
              }}
              disabled={(day) => {
                const dayOfWeek = day.getDay();
                return !schedulingSlots.some((s) => (s.day_of_week % 7) === dayOfWeek);
              }}
              className="rounded-lg border border-gray-200"
            />
          </div>

          {selectedDate && slotsForSelectedDay.length > 0 && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {lang === 'es' ? 'Seleccionar Horario' : 'Select Time Slot'} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {slotsForSelectedDay.flatMap((slot) => {
                  const times = [];
                  const [startH, startM] = slot.start_time.split(':').map(Number);
                  const [endH, endM] = slot.end_time.split(':').map(Number);
                  const startMinutes = startH * 60 + startM;
                  const endMinutes = endH * 60 + endM;
                  for (let m = startMinutes; m + 60 <= endMinutes; m += 60) {
                    const from = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
                    const to = `${String(Math.floor((m + 60) / 60)).padStart(2, '0')}:${String((m + 60) % 60).padStart(2, '0')}`;
                    const label = `${from} - ${to}`;
                    times.push(
                      <button
                        key={label}
                        onClick={() => setSelectedTimeSlot(label)}
                        className={`px-3 py-2 rounded-lg text-sm border text-left transition-colors ${
                          selectedTimeSlot === label
                            ? 'bg-[hsl(210,100%,45%)] text-white border-[hsl(210,100%,45%)]'
                            : 'bg-white text-foreground border-gray-200 hover:border-[hsl(210,100%,45%)]'
                        }`}
                      >
                        {from} - {to}
                      </button>
                    );
                  }
                  return times;
                })}
              </div>
            </div>
          )}

          {selectedDate && (
            <p className="text-sm text-center text-muted-foreground">
              {lang === 'es' ? 'Seleccionado:' : 'Selected:'}{' '}
              <span className="font-medium text-foreground">{formatDate(selectedDate)}</span>
              {selectedTimeSlot && (
                <>
                  {' '}
                  {lang === 'es' ? 'a las' : 'at'}{' '}
                  <span className="font-medium text-foreground">{selectedTimeSlot}</span>
                </>
              )}
            </p>
          )}

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">{t.common.cancel}</Button>
            </DialogClose>
            <Button onClick={handleSchedule} disabled={!selectedDate || !selectedTimeSlot}>
              {lang === 'es' ? 'Confirmar Entrevista' : 'Schedule Interview'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!contractProcess}
        onOpenChange={(open) => {
          if (!open) setContractProcess(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {lang === 'es' ? 'Iniciar Firma de Contrato' : 'Initiate Contract Signing'}
            </DialogTitle>
            <DialogDescription>
              {contractProcess && (
                <>
                  {lang === 'es'
                    ? `Se enviará una solicitud de aprobación al administrador para iniciar la firma de contrato de ${getApplicantById(contractProcess.applicant_id)?.display_name || 'el candidato'} para el rol ${contractProcess.role_title}.`
                    : `An approval request will be sent to the administrator to initiate contract signing for ${getApplicantById(contractProcess.applicant_id)?.display_name || 'the candidate'} for ${contractProcess.role_title}.`}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-4">
            <FileSignature className="w-8 h-8 text-blue-600" />
            <p className="text-sm text-blue-800">
              {lang === 'es'
                ? 'Se enviará una solicitud de aprobación al administrador. El proceso avanzará tras su aprobación.'
                : 'A request for approval will be sent to the admin. The process will advance only after admin approval.'}
            </p>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">{t.common.cancel}</Button>
            </DialogClose>
            <Button onClick={handleInitiateContract} className="gap-2">
              <FileSignature className="w-4 h-4" />
              {lang === 'es' ? 'Enviar Solicitud' : 'Send Approval Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
