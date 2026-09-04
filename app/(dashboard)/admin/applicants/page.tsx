'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { RoleBadge } from '@/components/role-badge';
import { Button } from '@/components/ui/button';
import { useData } from '@/lib/data-context';
import type { TalentProfile, TalentSkill } from '@/types';
import { Eye, Check, Minus, Download } from 'lucide-react';
import { getApplicantCompletionPercent } from '@/lib/profile-completion';

type TalentWithSkills = TalentProfile & { skills: TalentSkill[] };

function calcCompletion(p: TalentWithSkills): number {
  return getApplicantCompletionPercent(p);
}

const visibilityFilters = ['All', 'Visible', 'Hidden'] as const;
const featuredFilters = ['All', 'Featured', 'Not Featured'] as const;

function csvEscape(value: string | number | boolean): string {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function exportApplicantsCsv(rows: TalentWithSkills[]) {
  const headers = [
    'display_name', 'slug', 'title', 'english_level', 'availability_status',
    'years_experience', 'tech_stack', 'public_visible', 'featured', 'created_at',
  ];
  const lines = [
    headers.join(','),
    ...rows.map((r) => [
      csvEscape(r.display_name),
      csvEscape(r.slug),
      csvEscape(r.title),
      csvEscape(r.english_level),
      csvEscape(r.availability_status),
      csvEscape(r.years_experience),
      csvEscape(r.tech_stack?.join('; ') ?? ''),
      csvEscape(r.public_visible),
      csvEscape(r.featured),
      csvEscape(r.created_at),
    ].join(',')),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `applicants-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ApplicantManagementPage() {
  const { talentProfiles, isHydrated } = useData();
  const router = useRouter();
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
  }, [talentProfiles, visibilityFilter, featuredFilter]);

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
      render: (item) => (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => router.push(`/admin/applicants/${item.id}`)}>
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-foreground">Applicants</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-[hsl(210,100%,45%)]/10 text-[hsl(210,100%,45%)] border border-[hsl(210,100%,45%)]/20">
            {talentProfiles.length}
          </span>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => exportApplicantsCsv(filteredProfiles)}>
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
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
