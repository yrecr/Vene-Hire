'use client';

import { useState, useMemo, useCallback } from 'react';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { RoleBadge } from '@/components/role-badge';
import { Button } from '@/components/ui/button';
import { useMockData } from '@/lib/data-context';
import type { AccessRequest, Profile, EmployerProfile, TalentProfile } from '@/types';
import { Eye, CircleCheck, CircleX } from 'lucide-react';

const TALENT_PROFILES_KEY = 'vh-talent-profiles';
const PROFILES_KEY = 'vh-profiles';
const EMPLOYERS_KEY = 'vh-employers';

const statusTabs = ['All', 'Pending', 'Contacted', 'Approved', 'Rejected'] as const;
const typeTabs = ['All', 'Applicant Requests', 'Employer Requests'] as const;

export default function AccessRequestsPage() {
  const { accessRequests, setAccessRequests, setProfiles, profiles, employerProfiles } = useMockData();
  const [requests, setRequests] = useState(accessRequests);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('All');
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('All');

  const updateStatus = useCallback((id: string, status: AccessRequest['status']) => {
    setRequests((prev) => {
      const req = prev.find((r) => r.id === id);
      const next = prev.map((r) => r.id === id ? { ...r, status } : r);
      setAccessRequests(next);

      if (status === 'approved' && req) {
        const now = Date.now();
        const profileId = `p-${now}`;
        const newProfiles = [...profiles];
        if (!newProfiles.some((p) => p.email === req.email)) {
          newProfiles.push({
            id: profileId,
            auth_user_id: `auth-${now}`,
            full_name: req.full_name,
            email: req.email,
            role: req.request_type === 'employer' ? 'employer' : 'applicant',
            company_name: req.company || null,
            status: 'active',
            created_at: new Date().toISOString(),
          });
        }
        setProfiles(newProfiles);

        let employerProfileId: string | undefined;
        let talentProfileId: string | undefined;

        if (req.request_type === 'employer') {
          employerProfileId = `emp-${now}`;
          const newEmployers = [...employerProfiles];
          if (!newEmployers.some((e) => e.user_id === profileId)) {
            newEmployers.push({
              id: employerProfileId,
              user_id: profileId,
              company_name: req.company || req.full_name,
              contact_name: req.full_name,
              summary: `Approved demo request for ${req.company || req.full_name}.`,
              hiring_needs: req.hiring_need || 'Not specified',
              status: 'active',
              created_at: new Date().toISOString(),
            });
          }
        } else {
          talentProfileId = `tp-${now}`;
          const slugBase = req.full_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          const rawT = localStorage.getItem(TALENT_PROFILES_KEY);
          const existingTalent: TalentProfile[] = rawT ? JSON.parse(rawT) : [];
          if (!existingTalent.some((t) => t.user_id === profileId)) {
            existingTalent.push({
              id: talentProfileId,
              user_id: profileId,
              slug: `${slugBase}-${now}`,
              display_name: req.full_name,
              title: req.hiring_need || 'Developer',
              summary: `${req.full_name} — approved applicant.`,
              bio: '',
              tech_stack: [],
              english_level: 'Intermediate',
              availability_status: 'Available',
              years_experience: 0,
              featured: false,
              public_visible: false,
              video_url: null,
              profile_image_url: null,
              resume_url: null,
              timezone: 'America/Bogota',
              profile_completion: 10,
              created_at: new Date().toISOString(),
              skills: [],
            });
            localStorage.setItem(TALENT_PROFILES_KEY, JSON.stringify(existingTalent));
          }
        }
      }

      return next;
    });
  }, []);

  const filteredRequests = useMemo(() => {
    let result = requests;

    if (activeTypeFilter === 'Applicant Requests') {
      result = result.filter((r) => r.request_type === 'applicant');
    } else if (activeTypeFilter === 'Employer Requests') {
      result = result.filter((r) => r.request_type === 'employer');
    }

    if (activeStatusFilter !== 'All') {
      result = result.filter(
        (r) => r.status === activeStatusFilter.toLowerCase()
      );
    }

    return result;
  }, [requests, activeStatusFilter, activeTypeFilter]);

  const columns: DataTableColumn<AccessRequest>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (item) => <span className="font-medium text-foreground">{item.full_name}</span>,
    },
    {
      key: 'request_type',
      header: 'Type',
      render: (item) => <RoleBadge role={item.request_type} />,
    },
    {
      key: 'company',
      header: 'Company',
      render: (item) => <span className="text-muted-foreground">{item.company || '-'}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (item) => <span className="text-muted-foreground">{item.email}</span>,
    },
    {
      key: 'role',
      header: 'Role / Need',
      render: (item) => <span className="text-muted-foreground">{item.hiring_need}</span>,
    },
    {
      key: 'candidate',
      header: 'Candidate',
      render: (item) => (
        <span className="text-muted-foreground">
          {item.candidate_slug || 'General'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <RoleBadge role={item.status} />,
    },
    {
      key: 'date',
      header: 'Date',
      render: (item) => (
        <span className="text-muted-foreground">
          {new Date(item.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-1">
          {item.status === 'pending' ? (
            <>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700"
                onClick={() => updateStatus(item.id, 'approved')}
              >
                <CircleCheck className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                onClick={() => updateStatus(item.id, 'rejected')}
              >
                <CircleX className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <span className="text-xs text-muted-foreground italic">
              {item.status === 'approved' ? 'Approved' : 'Rejected'}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-foreground">Access Requests</h2>
        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-[hsl(210,100%,45%)]/10 text-[hsl(210,100%,45%)] border border-[hsl(210,100%,45%)]/20">
          {requests.length}
        </span>
      </div>

      {/* Type Filter Tabs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {typeTabs.map((tab) => (
            <Button
              key={tab}
              variant={activeTypeFilter === tab ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTypeFilter(tab)}
              className="rounded-full"
            >
              {tab}
            </Button>
          ))}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {statusTabs.map((tab) => (
            <Button
              key={tab}
              variant={activeStatusFilter === tab ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveStatusFilter(tab)}
              className="rounded-full"
            >
              {tab}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filteredRequests} />
    </div>
  );
}
