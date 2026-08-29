'use client';

import { useEffect, useMemo } from 'react';
import { MessageSquare, Calendar, Building2, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { RoleBadge } from '@/components/role-badge';
import { useData } from '@/lib/data-context';

export default function ApplicantInterviewsPage() {
  const { currentUser } = useAuth();
  const { interviewRequests, respondToInterview, talentProfiles, employerProfiles, isHydrated, refreshAll } = useData();

  useEffect(() => { refreshAll(); }, [refreshAll]);
  const user = currentUser;

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

  const interviews = useMemo(function () {
    if (!talentProfile) return [];
    return interviewRequests.filter(function (r) { return r.applicant_id === talentProfile.id; });
  }, [talentProfile, interviewRequests]);

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

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isHydrated && !talentProfile) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Interview Requests</h2>
          <p className="text-muted-foreground mt-1">View and manage interview requests from employers.</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-muted-foreground">Could not find your talent profile. Contact support if this persists.</p>
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
            var employer = employerProfiles.find(function (e) {
              return e.id === interview.employer_id;
            });
            var isPending = interview.status === 'pending';

            return (
              <div
                key={interview.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
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
                        {interview.role_title}
                      </p>
                    </div>
                  </div>
                  <RoleBadge role={interview.status} />
                </div>

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

                <p className="text-sm text-muted-foreground mb-4">{interview.message}</p>

                {isPending && (
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={() => respondToInterview(interview.id, 'accepted')}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => respondToInterview(interview.id, 'declined')}
                    >
                      <XCircle className="w-4 h-4" />
                      Decline
                    </Button>
                  </div>
                )}

                {interview.status === 'accepted' && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-sm font-medium text-emerald-600 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Accepted — waiting for the employer to share a meeting link.
                    </span>
                  </div>
                )}

                {interview.status === 'declined' && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-sm font-medium text-red-600 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" />
                      Declined
                    </span>
                  </div>
                )}

                {interview.status === 'scheduled' && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-1">
                      Meeting scheduled
                    </span>
                    {interview.meeting_url && (
                      <a
                        href={interview.meeting_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-[hsl(210,100%,45%)] hover:underline flex items-center gap-1"
                      >
                        Join meeting <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}

                {interview.status === 'completed' && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className={`text-sm font-medium flex items-center gap-1.5 ${interview.outcome === 'passed' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {interview.outcome === 'passed' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      Result: {interview.outcome === 'passed' ? 'Passed' : 'Not selected'}
                    </span>
                    {interview.outcome_notes && (
                      <p className="text-sm text-muted-foreground mt-1">{interview.outcome_notes}</p>
                    )}
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-3">
                  Requested {new Date(interview.created_at).toLocaleDateString('en-US', {
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
