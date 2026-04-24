'use client';

import { useState, useMemo } from 'react';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { RoleBadge } from '@/components/role-badge';
import { Button } from '@/components/ui/button';
import { mockProfiles } from '@/data/mock';
import type { Profile } from '@/types';
import { Plus, Search, Pencil, X } from 'lucide-react';

export default function UserManagementPage() {
  const [search, setSearch] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUserRole, setNewUserRole] = useState<string>('applicant');

  const filteredProfiles = useMemo(() => {
    if (!search.trim()) return mockProfiles;
    const q = search.toLowerCase();
    return mockProfiles.filter(
      (p) =>
        p.full_name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        (p.company_name && p.company_name.toLowerCase().includes(q))
    );
  }, [search]);

  const columns: DataTableColumn<Profile>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (item) => <span className="font-medium text-foreground">{item.full_name}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (item) => <span className="text-muted-foreground">{item.email}</span>,
    },
    {
      key: 'role',
      header: 'Role',
      render: (item) => <RoleBadge role={item.role} />,
    },
    {
      key: 'company',
      header: 'Company',
      render: (item) => (
        <span className="text-muted-foreground">{item.company_name || '-'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <RoleBadge role={item.status} />,
    },
    {
      key: 'created',
      header: 'Created',
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
      render: () => (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Pencil className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-foreground">User Management</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-[hsl(210,100%,45%)]/10 text-[hsl(210,100%,45%)] border border-[hsl(210,100%,45%)]/20">
            {mockProfiles.length}
          </span>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create User
        </Button>
      </div>

      {/* Create User Inline Form */}
      {showCreateForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-foreground">Create New User</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setShowCreateForm(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter full name"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter email address"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Role
              </label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)]"
              >
                <option value="admin">Admin</option>
                <option value="applicant">Applicant</option>
                <option value="employer">Employer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Status
              </label>
              <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)]">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            {newUserRole === 'employer' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="Enter company name"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)]"
                />
              </div>
            )}
            {newUserRole === 'applicant' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Enter job title"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)]"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create
            </Button>
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, email, role, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)] bg-white"
        />
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filteredProfiles} />
    </div>
  );
}
