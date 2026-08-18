'use client';

import { useState } from 'react';
import { MessageSquare, Calendar, Clock, CheckCircle2, XCircle, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { RoleBadge } from '@/components/role-badge';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data-context';
import type { InterviewRequest } from '@/types';

function AddMeetingLinkForm({ interview }: { interview: InterviewRequest }) {
  const { addMeetingLink } = useData();
  const [url, setUrl] = useState('');

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste the Google Meet / Teams link"
        className="text-sm"
      />
      <Button
        size="sm"
        className="gap-1.5 flex-shrink-0"
        disabled={!url.trim()}
        onClick={() => addMeetingLink(interview.id, url.trim())}
      >
        <LinkIcon className="w-4 h-4" />
        Save Link
      </Button>
    </div>
  );
}

function ReportOutcomeForm({ interview }: { interview: InterviewRequest }) {
  const { reportInterviewOutcome } = useData();
  const [notes, setNotes] = useState('');

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes about how the interview went (optional)"
        className="text-sm"
        rows={2}
      />
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          onClick={() => reportInterviewOutcome(interview.id, 'passed', notes.trim())}
        >
          <CheckCircle2 className="w-4 h-4" />
          Passed
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 border-red-200 text-red-700 hover:bg-red-50"
          onClick={() => reportInterviewOutcome(interview.id, 'failed', notes.trim())}
        >
          <XCircle className="w-4 h-4" />
          Failed
        </Button>
      </div>
    </div>
  );
}

export default function EmployerRequestsPage() {
  const { currentUser } = useAuth();
  const { interviewRequests, getApplicantById, employerProfiles } = useData();

  const employerProfile = currentUser?.employer_profile_id ? employerProfiles.find((e) => e.id === currentUser.employer_profile_id) : undefined;

  const employerId = employerProfile?.id ?? '';

  const interviews = interviewRequests.filter((r) => r.employer_id === employerId);

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

                {interview.status === 'declined' && (
                  <div className="mt-3 flex items-center gap-1.5 text-sm font-medium text-red-600">
                    <XCircle className="w-4 h-4" />
                    Declined
                  </div>
                )}

                {interview.status === 'accepted' && (
                  <>
                    <div className="mt-3 flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                      Accepted — coordinate the meeting by email, then paste the link here.
                    </div>
                    <AddMeetingLinkForm interview={interview} />
                  </>
                )}

                {interview.status === 'scheduled' && (
                  <>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">Meeting scheduled</span>
                      {interview.meeting_url && (
                        <a
                          href={interview.meeting_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-[hsl(210,100%,45%)] hover:underline flex items-center gap-1"
                        >
                          Open link <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    <ReportOutcomeForm interview={interview} />
                  </>
                )}

                {interview.status === 'completed' && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className={`flex items-center gap-1.5 text-sm font-medium ${interview.outcome === 'passed' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {interview.outcome === 'passed' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      Result: {interview.outcome === 'passed' ? 'Passed' : 'Failed'}
                    </div>
                    {interview.outcome_notes && (
                      <p className="text-sm text-muted-foreground mt-1">{interview.outcome_notes}</p>
                    )}
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
