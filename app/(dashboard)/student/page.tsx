'use client';

import Link from 'next/link';
import { StatCard } from '@/components/stat-card';
import { RoleBadge } from '@/components/role-badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMockData } from '@/lib/data-context';
import { TrendingUp, CircleCheck as CheckCircle2, FolderOpen, Clock, FileText, ArrowRight } from 'lucide-react';

const upcomingAssignments = [
  { title: 'Build REST API', dueDate: 'Apr 15', status: 'In Progress' },
  { title: 'React Dashboard', dueDate: 'Apr 22', status: 'Not Started' },
  { title: 'System Design Doc', dueDate: 'Apr 29', status: 'Not Started' },
];

export default function StudentDashboardPage() {
  const { enrollments, bootcamps, resources } = useMockData();
  const enrollment = enrollments[0];
  const bootcamp = bootcamps[0];
  const studentResources = resources.filter(
    (r) => r.visibility === 'student' || r.visibility === 'all'
  ).slice(0, 2);
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Welcome back, Maria</h2>
        <p className="text-muted-foreground mt-1">
          Track your progress, manage assignments, and access learning resources.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Bootcamp Progress" value="65%" trend="+5%" trendUp />
        <StatCard icon={CheckCircle2} label="Assignments Completed" value="8/12" trend="+2" trendUp />
        <StatCard icon={FolderOpen} label="Resources Available" value={4} />
        <StatCard icon={Clock} label="Days Remaining" value={42} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Bootcamp */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Current Bootcamp</h3>
            <RoleBadge role={enrollment.status} />
          </div>
          <p className="text-base font-medium text-foreground mb-1">{bootcamp.title}</p>
          <p className="text-sm text-muted-foreground mb-4">{bootcamp.description}</p>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-foreground">Progress</span>
              <span className="text-sm font-semibold text-[hsl(210,100%,45%)]">{enrollment.progress}%</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[hsl(210,100%,45%)] to-[hsl(170,60%,42%)] rounded-full transition-all duration-700"
                style={{ width: `${enrollment.progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Start: {bootcamp.start_date}</span>
            <span>End: {bootcamp.end_date}</span>
          </div>

          <Link href="/student/bootcamp">
            <Button variant="outline" size="sm" className="mt-4">
              View Details <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Upcoming Assignments */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Upcoming Assignments</h3>
            <Link href="/student/projects">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingAssignments.map((assignment) => (
              <div
                key={assignment.title}
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{assignment.title}</p>
                  <p className="text-xs text-muted-foreground">Due {assignment.dueDate}</p>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    assignment.status === 'In Progress'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }
                >
                  {assignment.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Resources */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Recent Resources</h3>
          <Link href="/student/resources">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {studentResources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-[hsl(210,100%,45%)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{resource.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {resource.description}
                  </p>
                  <Button variant="outline" size="sm" className="mt-3">
                    View
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
