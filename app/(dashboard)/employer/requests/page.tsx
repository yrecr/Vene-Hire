'use client';

import { useMemo } from 'react';
import { MessageSquare, Calendar, Clock, CheckCircle2, XCircle, Video } from 'lucide-react';
import { RoleBadge } from '@/components/role-badge';
import { EmptyState } from '@/components/empty-state';
import { useDemoAuth } from '@/lib/demo-auth';
import { useMockData } from '@/lib/data-context';
import { mockEmployerProfiles } from '@/data/mock';

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
  scheduled: 'Scheduled',
  completed: 'Completed',
};

export default function EmployerRequestsPage() {
  const { currentUser } = useDemoAuth();
  const { interviewRequests, getApplicantById } = useMockData();

  const employerProfile = currentUser?.employer_profile_id
    ? mockEmployerProfiles.find((e) => e.id === currentUser.employer_profile_id)
    : mockEmployerProfiles[0];

  const employerId = employerProfile?.id || 'ep-acme';

  const interviews = useMemo(
    () => interviewRequests.filter((r) => r.employer_id === employerId),
    [interviewRequests, employerId]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Interview Requests</h2>
        <p className="text-muted-foreground mt-1">
          Manage your interview scheduling and requests.
        </p>
      </div>

      {interviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No interview requests"
          description="You haven't made any interview requests yet. Browse applicants to get started."
        />
      ) : (
        <div className="space-y-4">
          {interviews.map((interview) => {
            const applicant = getApplicantById(interview.applicant_id);
            return (
              <div
                key={interview.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {applicant && (
                      <img
                        src={applicant.profile_image_url || ''}
                        alt={applicant.display_name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground">
                        {applicant?.display_name || 'Unknown Applicant'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {interview.role_title}
                      </p>
                    </div>
                  </div>
                  <RoleBadge role={interview.status} />
                </div>

                {interview.message && (
                  <p className="text-sm text-muted-foreground mt-3">{interview.message}</p>
                )}

                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                  {interview.requested_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(interview.requested_date).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: 'numeric', minute: '2-digit',
                      })}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Requested{' '}
                    {new Date(interview.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </span>
                </div>

                {interview.meeting_url && (
                  <a
                    href={interview.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 mt-2"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Join Zoom Meeting
                  </a>
                )}

                {interview.status === 'accepted' && (
                  <div className="mt-3 flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    Accepted — A selection process has been started.
                  </div>
                )}

                {interview.status === 'declined' && (
                  <div className="mt-3 flex items-center gap-1.5 text-sm font-medium text-red-600">
                    <XCircle className="w-4 h-4" />
                    Declined
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
