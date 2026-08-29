'use client';

import { useState, useMemo } from 'react';
import { MapPin, Clock, ChevronDown, ChevronUp, Medal, X, Briefcase, Users, Target, Loader as Loader2 } from 'lucide-react';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data-context';
import type { Vacancy, Candidate } from '@/types';

const iaBadge = (ai_status: Candidate['ai_status']) => {
  const styles = {
    Advance: 'bg-emerald-50 text-emerald-600',
    Hold: 'bg-amber-50 text-amber-600',
    Reject: 'bg-red-50 text-red-600',
  };
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${styles[ai_status]}`}>{ai_status}</span>;
};

const medalIcon = (i: number) => {
  if (i === 0) return <Medal className="w-4 h-4 text-yellow-500 fill-yellow-500" />;
  if (i === 1) return <Medal className="w-4 h-4 text-gray-400 fill-gray-400" />;
  if (i === 2) return <Medal className="w-4 h-4 text-amber-700 fill-amber-700" />;
  return null;
};

export default function VacanciesPage() {
  const { currentUser } = useAuth();
  const { employerProfiles, isHydrated, vacancies, candidates: allCandidates, createVacancy, updateCandidateStatus } = useData();
  const employerProfile = employerProfiles.find((e) => e.id === currentUser?.employer_profile_id);
  const employerId = employerProfile?.id || currentUser?.employer_profile_id || '';

  // vacancies is already scoped to this employer server-side via RLS
  // (fetchVacancies only returns rows the caller owns) — no client filter needed.
  const activeVacancies = vacancies.filter((v) => v.status === 'Open');
  const totalCandidates = allCandidates.filter((c) => vacancies.some((v) => v.id === c.vacancy_id)).length;
  const avgPerVacancy = activeVacancies.length ? (totalCandidates / activeVacancies.length).toFixed(1) : '0';

  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [updatingCandidateId, setUpdatingCandidateId] = useState<string | null>(null);
  const [newVac, setNewVac] = useState({ title: '', department: '', location: '', employment_type: 'Full-time' as Vacancy['employment_type'], work_mode: 'Remote' as Vacancy['work_mode'] });

  const vacancyCandidates = useMemo(
    () => (selectedVacancy
      ? allCandidates.filter((c) => c.vacancy_id === selectedVacancy.id).sort((a, b) => b.score - a.score)
      : []),
    [selectedVacancy, allCandidates]
  );

  async function handleCreateVacancy() {
    if (!newVac.title.trim() || !employerId) return;
    setIsCreating(true);
    setCreateError(null);
    const now = new Date().toISOString();
    try {
      await createVacancy({
        id: crypto.randomUUID(), employer_id: employerId,
        title: newVac.title, department: newVac.department,
        location: newVac.location, employment_type: newVac.employment_type,
        work_mode: newVac.work_mode, status: 'Open',
        published_at: now, created_at: now,
      });
      setNewVac({ title: '', department: '', location: '', employment_type: 'Full-time', work_mode: 'Remote' });
      setShowCreate(false);
    } catch {
      setCreateError('No se pudo crear la vacante. Intenta de nuevo.');
    } finally {
      setIsCreating(false);
    }
  }

  async function handleStatusChange(candidateId: string, status: Candidate['manual_status']) {
    setUpdatingCandidateId(candidateId);
    try {
      await updateCandidateStatus(candidateId, status);
    } catch {
      // optimistic update already reverted by the context on failure
    } finally {
      setUpdatingCandidateId(null);
    }
  }

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Vacantes</h2>
          <p className="text-muted-foreground mt-1">Gestiona tus vacantes activas y revisa candidatos con análisis IA.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ Nueva Vacante</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Briefcase} label="Vacantes Activas" value={activeVacancies.length} />
        <StatCard icon={Users} label="Total Candidatos" value={totalCandidates} />
        <StatCard icon={Target} label="Promedio por Vacante" value={avgPerVacancy} />
      </div>

      {vacancies.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No hay vacantes todavía"
          description="Crea tu primera vacante para empezar a recibir candidatos evaluados por IA."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vacancies.map((vac) => {
            const count = allCandidates.filter((c) => c.vacancy_id === vac.id).length;
            return (
              <div key={vac.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-foreground text-lg leading-tight">{vac.title}</h3>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${vac.status === 'Open' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                    {vac.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs bg-gray-50 text-muted-foreground px-2 py-1 rounded-md">{vac.department}</span>
                  <span className="text-xs bg-gray-50 text-muted-foreground px-2 py-1 rounded-md flex items-center gap-1"><MapPin className="w-3 h-3" />{vac.location}</span>
                  <span className="text-xs bg-gray-50 text-muted-foreground px-2 py-1 rounded-md flex items-center gap-1"><Clock className="w-3 h-3" />{vac.employment_type}</span>
                  <span className="text-xs bg-gray-50 text-muted-foreground px-2 py-1 rounded-md">{vac.work_mode}</span>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
                  <span className="text-sm text-muted-foreground">{count} aplicante{count !== 1 ? 's' : ''}</span>
                  <Button size="sm" variant="outline" onClick={() => setSelectedVacancy(vac)}>
                    Ver candidatos &rarr;
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => !isCreating && setShowCreate(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Nueva Vacante</h3>
              <button className="p-1.5 rounded-lg hover:bg-gray-100" onClick={() => setShowCreate(false)}><X className="w-5 h-5" /></button>
            </div>
            {createError && <p className="text-sm text-red-600 mb-3">{createError}</p>}
            <div className="space-y-3">
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Título del cargo" value={newVac.title} onChange={(e) => setNewVac({ ...newVac, title: e.target.value })} />
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Departamento" value={newVac.department} onChange={(e) => setNewVac({ ...newVac, department: e.target.value })} />
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Ubicación" value={newVac.location} onChange={(e) => setNewVac({ ...newVac, location: e.target.value })} />
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" value={newVac.employment_type} onChange={(e) => setNewVac({ ...newVac, employment_type: e.target.value as Vacancy['employment_type'] })}>
                <option>Full-time</option><option>Part-time</option><option>Freelance</option>
              </select>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" value={newVac.work_mode} onChange={(e) => setNewVac({ ...newVac, work_mode: e.target.value as Vacancy['work_mode'] })}>
                <option>Remote</option><option>Hybrid</option><option>On-site</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowCreate(false)} disabled={isCreating}>Cancelar</Button>
              <Button onClick={handleCreateVacancy} disabled={isCreating || !newVac.title.trim()}>
                {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Crear Vacante
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedVacancy && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedVacancy(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg font-bold text-foreground">{selectedVacancy.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedVacancy.department} &middot; {selectedVacancy.location}</p>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-gray-100" onClick={() => setSelectedVacancy(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {vacancyCandidates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No hay candidatos para esta vacante.</p>
              ) : (
                vacancyCandidates.map((cand, i) => (
                  <div key={cand.id} className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-3 p-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(210,100%,45%)] to-[hsl(170,60%,42%)] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {cand.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{cand.name}</span>
                          {medalIcon(i)}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-[hsl(210,100%,45%)]">{cand.score}% match</span>
                          {iaBadge(cand.ai_status)}
                        </div>
                      </div>
                      <select
                        value={cand.manual_status}
                        disabled={updatingCandidateId === cand.id}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-muted-foreground disabled:opacity-50"
                        onChange={(e) => handleStatusChange(cand.id, e.target.value as Candidate['manual_status'])}
                      >
                        <option>Received</option>
                        <option>Interview</option>
                        <option>Offer</option>
                      </select>
                      <button
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-muted-foreground"
                        onClick={() => setExpandedCandidate(expandedCandidate === cand.id ? null : cand.id)}
                      >
                        {expandedCandidate === cand.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {expandedCandidate === cand.id && (
                      <div className="px-4 pb-4 pt-0 space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Resumen de Perfil</p>
                          <p className="text-sm text-foreground">{cand.profile_summary}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Razonamiento del Modelo</p>
                          <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">{cand.ai_reasoning}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Fortalezas</p>
                            <ul className="space-y-1">
                              {cand.strengths.map((f, j) => (
                                <li key={j} className="text-sm text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">{f}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Áreas de Mejora</p>
                            <ul className="space-y-1">
                              {cand.improvement_areas.map((a, j) => (
                                <li key={j} className="text-sm text-red-700 bg-red-50 px-2 py-1 rounded-md">{a}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground border-t border-gray-100 pt-3">
                          <span>Modelo: {cand.ai_model}</span>
                          <span>Tiempo: {cand.ai_response_time}</span>
                          <span>Tokens: {cand.ai_total_tokens.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
