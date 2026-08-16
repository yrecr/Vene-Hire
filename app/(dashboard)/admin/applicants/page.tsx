'use client';

import { useState, useMemo } from 'react';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { RoleBadge } from '@/components/role-badge';
import { Button } from '@/components/ui/button';
import { useData } from '@/lib/data-context';
import type { TalentProfile, TalentSkill } from '@/types';
import { Eye, Check, Minus } from 'lucide-react';

type TalentWithSkills = TalentProfile & { skills: TalentSkill[] };

function calcCompletion(p: TalentProfile): number {
  const checks = [
    p.display_name.length > 0,
    p.title.length > 0,
    (p.summary?.length ?? 0) > 2,
    (p.bio?.length ?? 0) > 0,
    (p.tech_stack?.length ?? 0) > 0,
    (p.tech_stack?.length ?? 0) > 0,
    p.english_level !== 'Basic',
    (p.resume_url?.length ?? 0) > 0,
    (p.video_url?.length ?? 0) > 0,
    p.availability_status !== 'In Training',
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

const visibilityFilters = ['All', 'Visible', 'Hidden'] as const;
const featuredFilters = ['All', 'Featured', 'Not Featured'] as const;

export default function ApplicantManagementPage() {
  const { talentProfiles } = useData();
  const [visibilityFilter, setVisibilityFilter] = useState<string>('All');
  const [featuredFilter, setFeaturedFilter] = useState<string>('All');

  const filteredProfiles = useMemo(() => {
    let result: TalentWithSkills[] = talentProfiles;

    if (visibilityFilter === 'Visible') {
      result = result.filter((p) => p.public_visible);
    } else if (visibilityFilter === 'Hidden') {
      result = result.filter((p) => !p.public_visible);
    }

    if (featuredFilter === 'Featured') {
      result = result.filter((p) => p.featured);
    } else if (featuredFilter === 'Not Featured') {
      result = result.filter((p) => !p.featured);
    }

    return result;
  }, [visibilityFilter, featuredFilter]);

  const columns: DataTableColumn<TalentWithSkills>[] = [
    {
      key: 'photo',
      header: 'Photo',
      render: (item) => (
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
          {item.profile_image_url ? (
            <img
              src={item.profile_image_url}
              alt={item.display_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-medium text-muted-foreground">
              {item.display_name.charAt(0)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (item) => (
        <div>
          <span className="font-medium text-foreground">{item.display_name}</span>
          <p className="text-xs text-muted-foreground">{item.slug}</p>
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Title',
      render: (item) => <span className="text-muted-foreground">{item.title}</span>,
    },
    {
      key: 'english',
      header: 'English Level',
      render: (item) => <span className="text-muted-foreground">{item.english_level}</span>,
    },
    {
      key: 'availability',
      header: 'Availability',
      render: (item) => <RoleBadge role={item.availability_status.toLowerCase().replace(' ', '_')} />,
    },
    {
      key: 'completion',
      header: 'Profile Completion',
      render: (item) => (
        <div className="flex items-center gap-2 min-w-[120px]">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${calcCompletion(item)}%`,
                backgroundColor:
                  calcCompletion(item) >= 80
                    ? 'hsl(152, 69%, 40%)'
                    : calcCompletion(item) >= 60
                    ? 'hsl(38, 92%, 50%)'
                    : 'hsl(0, 84%, 60%)',
              }}
            />
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {calcCompletion(item)}%
          </span>
        </div>
      ),
    },
    {
      key: 'featured',
      header: 'Featured',
      render: (item) =>
        item.featured ? (
          <Check className="w-4 h-4 text-emerald-600" />
        ) : (
          <Minus className="w-4 h-4 text-muted-foreground" />
        ),
    },
    {
      key: 'visible',
      header: 'Visible',
      render: (item) =>
        item.public_visible ? (
          <Check className="w-4 h-4 text-emerald-600" />
        ) : (
          <Minus className="w-4 h-4 text-muted-foreground" />
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: () => (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-foreground">Applicants</h2>
        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
          {talentProfiles.length}
        </span>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground mr-1">Visibility:</span>
          {visibilityFilters.map((tab) => (
            <Button
              key={tab}
              variant={visibilityFilter === tab ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVisibilityFilter(tab)}
              className="rounded-full"
            >
              {tab}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground mr-1">Featured:</span>
          {featuredFilters.map((tab) => (
            <Button
              key={tab}
              variant={featuredFilter === tab ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFeaturedFilter(tab)}
              className="rounded-full"
            >
              {tab}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filteredProfiles} />
    </div>
  );
}
