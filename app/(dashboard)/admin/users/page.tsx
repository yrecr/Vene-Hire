'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { RoleBadge } from '@/components/role-badge';
import { Button } from '@/components/ui/button';
import type { Profile } from '@/types';
import { Plus, Search, Pencil, Trash2, X, Save } from 'lucide-react';
import { useData } from '@/lib/data-context';
import * as api from '@/lib/supabase-service';

export default function UserManagementPage() {
  const { profiles: contextProfiles, setProfiles } = useData();
  const [profiles, setLocalProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Profile>>({});

  useEffect(() => { setLocalProfiles(contextProfiles); }, [contextProfiles]);

  function sync(list: Profile[]) {
    setLocalProfiles(list);
    setProfiles(list);
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return profiles;
    const q = search.toLowerCase();
    return profiles.filter(
      (p) =>
        p.full_name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        (p.company_name && p.company_name.toLowerCase().includes(q))
    );
  }, [search, profiles]);

  const startEdit = useCallback((p: Profile) => {
    setEditId(p.id);
    setEditData({ ...p });
  }, []);

  const saveEdit = useCallback(() => {
    const updated = profiles.find((p) => p.id === editId);
    if (!updated) return;
    const merged = { ...updated, ...editData } as Profile;
    sync(profiles.map((p) => p.id === editId ? merged : p));
    api.upsertProfile(merged).catch(() => {});
    setEditId(null);
    setEditData({});
  }, [editId, editData, profiles]);

  const deleteUser = useCallback((id: string) => {
    sync(profiles.filter((p) => p.id !== id));
    api.deleteProfile(id).catch(() => {});
  }, [profiles]);

  const columns: DataTableColumn<Profile>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (item) =>
        editId === item.id ? (
          <input value={editData.full_name || ''} onChange={(e) => setEditData((d) => ({ ...d, full_name: e.target.value }))}
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm" />
        ) : <span className="font-medium text-foreground">{item.full_name}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (item) =>
        editId === item.id ? (
          <input value={editData.email || ''} onChange={(e) => setEditData((d) => ({ ...d, email: e.target.value }))}
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm" />
        ) : <span className="text-muted-foreground">{item.email}</span>,
    },
    {
      key: 'role',
      header: 'Role',
      render: (item) =>
        editId === item.id ? (
          <select value={editData.role || 'applicant'} onChange={(e) => setEditData((d) => ({ ...d, role: e.target.value as Profile['role'] }))}
            className="rounded border border-gray-300 px-2 py-1 text-sm">
            <option value="admin">Admin</option>
            <option value="employer">Employer</option>
            <option value="applicant">Applicant</option>
          </select>
        ) : <RoleBadge role={item.role} />,
    },
    {
      key: 'company',
      header: 'Company',
      render: (item) =>
        editId === item.id ? (
          <input value={editData.company_name || ''} onChange={(e) => setEditData((d) => ({ ...d, company_name: e.target.value }))}
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm" />
        ) : <span className="text-muted-foreground">{item.company_name || '-'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) =>
        editId === item.id ? (
          <select value={editData.status || 'active'} onChange={(e) => setEditData((d) => ({ ...d, status: e.target.value as Profile['status'] }))}
            className="rounded border border-gray-300 px-2 py-1 text-sm">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        ) : <RoleBadge role={item.status} />,
    },
    {
      key: 'created',
      header: 'Created',
      render: (item) => (
        <span className="text-muted-foreground">
          {new Date(item.created_at).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) =>
        editId === item.id ? (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-600" onClick={saveEdit}>
              <Save className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setEditId(null); setEditData({}); }}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => startEdit(item)}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => { if (confirm('Delete this user?')) deleteUser(item.id); }}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-foreground">User Management</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
            {profiles.length}
          </span>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create User
        </Button>
      </div>

      {showCreate && (
        <CreateUserForm onSave={(p) => { sync([...profiles, p]); setShowCreate(false); }} onCancel={() => setShowCreate(false)} />
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, email, role, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
        />
      </div>

      <DataTable columns={columns} data={filtered} />
    </div>
  );
}

function CreateUserForm({ onSave, onCancel }: { onSave: (p: Profile) => void; onCancel: () => void }) {
  const [data, setData] = useState({ full_name: '', email: '', password: 'Demo123!', role: 'applicant' as Profile['role'], status: 'active' as Profile['status'], company_name: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const handleCreate = async () => {
    if (!data.full_name.trim() || !data.email.trim() || !data.password.trim()) return;
    setCreating(true);
    setCreateError('');

    const profile: Profile = {
      id: crypto.randomUUID(),
      auth_user_id: crypto.randomUUID(),
      full_name: data.full_name,
      email: data.email,
      role: data.role,
      company_name: data.company_name || null,
      status: data.status,
      created_at: new Date().toISOString(),
    };

    const res = await fetch('/api/approve-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        full_name: data.full_name,
        company: data.company_name,
        request_type: data.role === 'employer' ? 'employer' : 'applicant',
        password: data.password,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      setCreateError(err.error || 'Failed to create user');
      setCreating(false);
      return;
    }

    onSave(profile);
    setCreating(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-foreground">Create New User</h3>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onCancel}><X className="w-4 h-4" /></Button>
      </div>
      {createError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">{createError}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
          <input type="text" placeholder="Enter full name" value={data.full_name}
            onChange={(e) => setData((d) => ({ ...d, full_name: e.target.value }))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
          <input type="email" placeholder="Enter email address" value={data.email}
            onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
          <input type="text" placeholder="Leave as Demo123! for default" value={data.password}
            onChange={(e) => setData((d) => ({ ...d, password: e.target.value }))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
          <select value={data.role} onChange={(e) => setData((d) => ({ ...d, role: e.target.value as Profile['role'] }))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
            <option value="admin">Admin</option>
            <option value="applicant">Applicant</option>
            <option value="employer">Employer</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
          <select value={data.status} onChange={(e) => setData((d) => ({ ...d, status: e.target.value as Profile['status'] }))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        {data.role === 'employer' && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Company Name</label>
            <input type="text" placeholder="Enter company name" value={data.company_name}
              onChange={(e) => setData((d) => ({ ...d, company_name: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Button className="gap-2" disabled={creating} onClick={handleCreate}>
          {creating ? 'Creating...' : <><Plus className="w-4 h-4" /> Create</>}
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
