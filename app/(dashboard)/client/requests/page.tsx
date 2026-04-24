'use client';

import { mockAccessRequests } from '@/data/mock';
import { RoleBadge } from '@/components/role-badge';
import { Button } from '@/components/ui/button';

export default function ClientRequestsPage() {
  const myRequests = mockAccessRequests.slice(0, 2);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Requests</h2>
          <p className="text-muted-foreground mt-1">
            Track the status of your talent access requests.
          </p>
        </div>
        <Button>New Request</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myRequests.map((req) => (
          <div
            key={req.id}
            className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">{req.hiring_need}</h3>
              <RoleBadge role={req.status} />
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Candidate of Interest:</span>
                <p className="font-medium text-foreground">
                  {req.candidate_slug
                    ? req.candidate_slug
                        .split('-')
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' ')
                    : 'General Inquiry'}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Submitted:</span>
                <p className="font-medium text-foreground">{req.created_at}</p>
              </div>

              <div>
                <span className="text-muted-foreground">Message:</span>
                <p className="text-muted-foreground line-clamp-2">{req.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
