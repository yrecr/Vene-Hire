'use client';

import { useMemo } from 'react';
import { MessageSquare, Calendar, Building2 } from 'lucide-react';
import { useDemoAuth } from '@/lib/demo-auth';
import { Button } from '@/components/ui/button';
import { RoleBadge } from '@/components/role-badge';
import { mockTalentProfiles, mockEmployerProfiles, getInterviewsForApplicant, demoUsers } from '@/data/mock';

export default function ApplicantInterviewsPage() {
  const { currentUser } = useDemoAuth();
  const user = currentUser ?? demoUsers.find(function (u) { return u.role === 'applicant'; }) ?? null;

  const talentProfile = useMemo(function () {
    if (!user?.talent_profile_id) return null;
    return mockTalentProfiles.find(function (t) { return t.id === user.talent_profile_id; }) || null;
  }, [user]);

  const interviews = useMemo(function () {
    if (!talentProfile) return [];
    return getInterviewsForApplicant(talentProfile.id);
  }, [talentProfile]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Please sign in</h2>
          <p className="text-muted-foreground">Sign in with an applicant account to view your interviews.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Interview Requests</h2>
        <p className="text-muted-foreground mt-1">
          View and manage interview requests from employers.
        </p>
      </div>

      {interviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-7 h-7 text-[hsl(210,100%,45%)]" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No interview requests yet</h3>
          <p className="text-sm text-muted-foreground">
            When employers are interested in your profile, their requests will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviews.map(function (interview) {
            var employer = mockEmployerProfiles.find(function (e) {
              return e.id === interview.employer_id;
            });
            var isPending = interview.status === 'pending';

            return (
              <div
                key={interview.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-[hsl(210,100%,45%)]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {employer?.company_name || 'Unknown Company'}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {employer?.contact_name || ''}
                      </p>
                    </div>
                  </div>
                  <RoleBadge role={interview.status} />
                </div>

                {/* Date */}
                {interview.requested_date && (
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {new Date(interview.requested_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}

                {/* Message */}
                <p className="text-sm text-muted-foreground mb-4">{interview.message}</p>

                {/* Actions */}
                {isPending && (
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <Button size="sm" className="gap-1.5">
                      Accept
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      Decline
                    </Button>
                  </div>
                )}

                {/* Created date */}
                <p className="text-xs text-muted-foreground mt-3">
                  Requested {new Date(interview.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
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
