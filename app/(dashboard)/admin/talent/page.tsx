'use client';

import Link from 'next/link';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { RoleBadge } from '@/components/role-badge';
import { Button } from '@/components/ui/button';
import { mockTalentProfiles } from '@/data/mock';
import { Plus, Pencil, Eye, Check, Minus } from 'lucide-react';
import type { TalentProfile, TalentSkill } from '@/types';

type TalentWithSkills = TalentProfile & { skills: TalentSkill[] };

const availabilityStyleMap: Record<string, string> = {
  Available: 'approved',
  Hired: 'contacted',
  'In Training': 'pending',
  'On Hold': 'rejected',
};

const columns: DataTableColumn<TalentWithSkills>[] = [
  {
    key: 'photo',
    header: 'Photo',
    render: (item) => (
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
        {item.profile_image_url ? (
          <img
            src={item.profile_image_url}
            alt={item.display_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-medium">
            {item.display_name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
        )}
      </div>
    ),
    className: 'w-16',
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
    render: (item) => (
      <RoleBadge role={availabilityStyleMap[item.availability_status] || item.availability_status} />
    ),
  },
  {
    key: 'featured',
    header: 'Featured',
    render: (item) => (
      <span className="flex justify-center">
        {item.featured ? (
          <Check className="w-4 h-4 text-emerald-600" />
        ) : (
          <Minus className="w-4 h-4 text-gray-300" />
        )}
      </span>
    ),
    className: 'text-center',
  },
  {
    key: 'visible',
    header: 'Visible',
    render: (item) => (
      <span className="flex justify-center">
        {item.public_visible ? (
          <Check className="w-4 h-4 text-emerald-600" />
        ) : (
          <Minus className="w-4 h-4 text-gray-300" />
        )}
      </span>
    ),
    className: 'text-center',
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (item) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Pencil className="w-4 h-4" />
        </Button>
        <Link href={`/talent/${item.slug}`}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Eye className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    ),
  },
];

export default function TalentProfilesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Talent Profiles</h2>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Talent
        </Button>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={mockTalentProfiles} />
    </div>
  );
}
