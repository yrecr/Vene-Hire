'use client';

import { useState, useMemo } from 'react';
import { GitBranch, Video } from 'lucide-react';
import { useDemoAuth } from '@/lib/demo-auth';
import { useMockData } from '@/lib/data-context';
import { Button } from '@/components/ui/button';
import { ProcessTimeline } from '@/components/process-timeline';
import { ProcessStatusBadge } from '@/components/process-status-badge';
import { mockTalentProfiles, mockEmployerProfiles, demoUsers } from '@/data/mock';

type FilterType = 'all' | 'active' | 'completed';

export default function ApplicantProcessesPage() {
  const { currentUser } = useDemoAuth();
  const { selectionProcesses } = useMockData();
  const user = currentUser ?? demoUsers.find(function (u) { return u.role === 'applicant'; }) ?? null;

  const talentProfile = useMemo(function () {
    if (!user?.talent_profile_id) return null;
    return mockTalentProfiles.find(function (t) { return t.id === user.talent_profile_id; }) || null;
  }, [user]);

  const processes = useMemo(function () {
    if (!talentProfile) return [];
    return selectionProcesses.filter(function (p) { return p.applicant_id === talentProfile.id; });
  }, [talentProfile, selectionProcesses]);

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
          <h2 className="text-xl font-semibold text-foreground mb-2">Please sign in</h2>
          <p className="text-muted-foreground">Sign in with an applicant account to view your processes.</p>
        </div>
      </div>
    );
  }

  var filterOptions: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Selection Processes</h2>
        <p className="text-muted-foreground mt-1">
          Track the progress of your hiring processes with employers.
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
          <h3 className="text-lg font-semibold text-foreground mb-1">No processes found</h3>
          <p className="text-sm text-muted-foreground">
            {filter === 'all'
              ? 'When you are part of a selection process, it will appear here.'
              : 'No processes match the selected filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredProcesses.map(function (process) {
            var employer = mockEmployerProfiles.find(function (e) {
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
                      {employer?.company_name || 'Unknown Company'}
                    </p>
                  </div>
                  <ProcessStatusBadge status={process.status} />
                </div>

                <ProcessTimeline
                  currentStage={process.current_stage}
                  status={process.status}
                  introDate={process.intro_interview_date}
                  technicalDate={process.technical_interview_date}
                  contractStatus={process.contract_status}
                />

                {process.meeting_url && (
                  <a
                    href={process.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 mt-3"
                  >
                    <Video className="w-4 h-4" />
                    Join Zoom Meeting
                  </a>
                )}

                {process.notes && (
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Notes:</span> {process.notes}
                    </p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-3">
                  Started {new Date(process.created_at).toLocaleDateString('en-US', {
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
