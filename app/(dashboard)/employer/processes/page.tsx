'use client';

import { useState, useMemo } from 'react';
import { GitBranch } from 'lucide-react';
import { ProcessTimeline } from '@/components/process-timeline';
import { ProcessStatusBadge } from '@/components/process-status-badge';
import { EmptyState } from '@/components/empty-state';
import { useDemoAuth } from '@/lib/demo-auth';
import { useMockData } from '@/lib/data-context';
import { mockEmployerProfiles } from '@/data/mock';

const filterTabs = ['All', 'Active', 'Hired', 'On Hold', 'Not Selected'] as const;
type FilterTab = typeof filterTabs[number];

function tabToStatus(tab: FilterTab): string | null {
  if (tab === 'All') return null;
  if (tab === 'On Hold') return 'on_hold';
  if (tab === 'Not Selected') return 'not_selected';
  return tab.toLowerCase();
}

export default function EmployerProcessesPage() {
  const { currentUser } = useDemoAuth();
  const { selectionProcesses, getApplicantById } = useMockData();
  const [activeTab, setActiveTab] = useState<FilterTab>('All');

  const employerProfile = currentUser?.employer_profile_id
    ? mockEmployerProfiles.find((e) => e.id === currentUser.employer_profile_id)
    : mockEmployerProfiles[0];

  const employerId = employerProfile?.id || 'ep-acme';

  const processes = useMemo(
    () => selectionProcesses.filter((p) => p.employer_id === employerId),
    [selectionProcesses, employerId]
  );

  const filteredProcesses = useMemo(() => {
    const statusFilter = tabToStatus(activeTab);
    if (!statusFilter) return processes;
    return processes.filter((p) => p.status === statusFilter);
  }, [processes, activeTab]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Selection Processes</h2>
        <p className="text-muted-foreground mt-1">
          Track and manage your active hiring pipelines.
        </p>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filteredProcesses.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title="No processes found"
          description={
            activeTab === 'All'
              ? 'You have no selection processes yet. Start by browsing applicants and sending interview requests.'
              : `No processes with "${activeTab}" status.`
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
                      <img
                        src={applicant.profile_image_url || ''}
                        alt={applicant.display_name}
                        className="w-12 h-12 rounded-full object-cover"
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

                <div className="mb-4">
                  <ProcessTimeline
                    currentStage={process.current_stage as 'intro_interview' | 'technical_interview' | 'contract_signing'}
                    status={process.status as 'active' | 'hired' | 'not_selected' | 'on_hold'}
                    introDate={process.intro_interview_date}
                    technicalDate={process.technical_interview_date}
                    contractStatus={process.contract_status as 'pending' | 'under_review' | 'signed' | null}
                  />
                </div>

                {process.notes && (
                  <p className="text-sm text-muted-foreground mb-2">
                    <span className="font-medium text-foreground">Notes:</span> {process.notes}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Started{' '}
                  {new Date(process.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
