'use client';

import { RoleBadge } from '@/components/role-badge';
import { Button } from '@/components/ui/button';
import { mockBootcamps } from '@/data/mock';
import { Plus, Calendar, Users } from 'lucide-react';

const studentCounts: Record<string, number> = {
  bc1: 12,
  bc2: 0,
  bc3: 8,
};

export default function BootcampsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Bootcamps</h2>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Create Bootcamp
        </Button>
      </div>

      {/* Bootcamp Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockBootcamps.map((bootcamp) => (
          <div
            key={bootcamp.id}
            className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-foreground leading-tight pr-2">
                {bootcamp.title}
              </h3>
              <RoleBadge role={bootcamp.status} />
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {bootcamp.description}
            </p>

            <div className="mt-auto space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>
                  {bootcamp.start_date
                    ? new Date(bootcamp.start_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'TBD'}
                  {' - '}
                  {bootcamp.end_date
                    ? new Date(bootcamp.end_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'TBD'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4 shrink-0" />
                <span>{studentCounts[bootcamp.id] ?? 0} students enrolled</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
