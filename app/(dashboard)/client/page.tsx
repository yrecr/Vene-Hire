'use client';

import { Users, MessageSquare, CalendarCheck, FolderOpen } from 'lucide-react';
import { StatCard } from '@/components/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RoleBadge } from '@/components/role-badge';
import { mockTalentProfiles } from '@/data/mock';
import Link from 'next/link';

const recentRequests = [
  {
    id: '1',
    candidate: 'Maria Gonzalez',
    status: 'pending',
    date: '2024-03-20',
  },
  {
    id: '2',
    candidate: 'General Inquiry',
    status: 'contacted',
    date: '2024-03-18',
  },
];

export default function ClientDashboard() {
  const recommendedTalent = mockTalentProfiles
    .filter((t) => t.availability_status === 'Available')
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Welcome back, TechCorp</h2>
        <p className="text-muted-foreground mt-1">
          Browse available talent and manage your hiring requests.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Available Talent" value={6} trend="+3" trendUp />
        <StatCard icon={MessageSquare} label="Active Requests" value={2} />
        <StatCard icon={CalendarCheck} label="Interviews Scheduled" value={1} />
        <StatCard icon={FolderOpen} label="Resources Available" value={2} />
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
          {recentRequests.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between px-5 py-4"
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {req.candidate}
                  </p>
                  <p className="text-xs text-muted-foreground">{req.date}</p>
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
