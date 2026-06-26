'use client';

import { Users, MessageSquare, CalendarCheck, FolderOpen } from 'lucide-react';
import { StatCard } from '@/components/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RoleBadge } from '@/components/role-badge';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export default function ClientDashboard() {
  const { talentProfiles, accessRequests, resources } = useData();
  const { currentUser } = useAuth();
  const availableCount = talentProfiles.filter((t) => t.availability_status === 'Available').length;
  const recommendedTalent = talentProfiles.filter((t) => t.availability_status === 'Available').slice(0, 3);
  const activeRequests = accessRequests.filter((r) => r.status === 'pending').length;
  const resourcesAvailable = resources.length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Welcome back, {currentUser?.full_name || 'Client'}</h2>
        <p className="text-muted-foreground mt-1">
          Browse available talent and manage your hiring requests.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Available Talent" value={availableCount} />
        <StatCard icon={MessageSquare} label="Active Requests" value={activeRequests} />
        <StatCard icon={CalendarCheck} label="Interviews Scheduled" value={0} />
        <StatCard icon={FolderOpen} label="Resources Available" value={resourcesAvailable} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Recommended Talent</h3>
          <Link href="/client/talent">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendedTalent.map((talent) => (
            <div
              key={talent.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={talent.profile_image_url || ''}
                  alt={talent.display_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-foreground text-sm">
                    {talent.display_name}
                  </h4>
                  <p className="text-xs text-muted-foreground">{talent.title}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {talent.summary}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {talent.tech_stack.slice(0, 3).map((tech) => (
                  <Badge
                    key={tech}
                    variant="secondary"
                    className="text-xs font-normal"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
              <Link href={`/talent/${talent.slug}`}>
                <Button variant="outline" size="sm" className="w-full">
                  View Profile
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Recent Requests</h3>
          <Link href="/client/requests">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
          {accessRequests.slice(0, 5).map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between px-5 py-4"
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {req.full_name || 'Request'}
                  </p>
                  <p className="text-xs text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <RoleBadge role={req.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
