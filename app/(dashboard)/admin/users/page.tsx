'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { PageLoading } from '@/components/page-loading';
import { RoleBadge } from '@/components/role-badge';
import { Button } from '@/components/ui/button';
import { DeleteAccountDialog } from '@/components/delete-account-dialog';
import type { Profile } from '@/types';
import { Plus, Search, Pencil, Trash2, X, Save } from 'lucide-react';
import { useData } from '@/lib/data-context';
import { useT } from '@/lib/i18n';
import * as api from '@/lib/supabase-service';
import { demoGuard, isDemoMode } from '@/lib/demo';

export default function UserManagementPage() {
  const { t, formatDate } = useT();
  const { profiles: contextProfiles, setProfiles, isHydrated } = useData();
  const [profiles, setLocalProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Profile>>({});
  const [deleting, setDeleting] = useState<Profile | null>(null);

  useEffect(() => { setLocalProfiles(contextProfiles); }, [contextProfiles]);

  const sync = useCallback((list: Profile[]) => {
    setLocalProfiles(list);
    setProfiles(list);
  }, [setProfiles]);

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
    if (!isDemoMode()) {
      api.upsertProfile(merged).catch(() => {});
    }
    setEditId(null);
    setEditData({});
  }, [editId, editData, profiles, sync]);

  const deleteUser = useCallback(async (id: string) => {
    if (demoGuard('delete a user')) return;
    // Not optimistic: this is a real, irreversible network call that can fail
    // (e.g. the "last remaining admin" guard) — the row should only disappear
    // once the account is actually gone.
    await api.deleteAccount(id);
    sync(profiles.filter((p) => p.id !== id));
  }, [profiles, sync]);

  const columns: DataTableColumn<Profile>[] = useMemo(() => [
    {
      key: 'name',
      header: t.admin.colName,
      render: (item) =>
        editId === item.id ? (
          <input value={editData.full_name || ''} onChange={(e) => setEditData((d) => ({ ...d, full_name: e.target.value }))}
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm" />
        ) : <span className="font-medium text-foreground">{item.full_name}</span>,
    },
    {
      key: 'email',
      header: t.admin.colEmail,
      render: (item) =>
        editId === item.id ? (
          <input value={editData.email || ''} onChange={(e) => setEditData((d) => ({ ...d, email: e.target.value }))}
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm" />
        ) : <span className="text-muted-foreground">{item.email}</span>,
    },
    {
      key: 'role',
      header: t.admin.colRole,
      render: (item) =>
        editId === item.id ? (
          <select value={editData.role || 'applicant'} onChange={(e) => setEditData((d) => ({ ...d, role: e.target.value as Profile['role'] }))}
            className="rounded border border-gray-300 px-2 py-1 text-sm">
            <option value="admin">{t.badges.admin}</option>
            <option value="employer">{t.badges.employer}</option>
            <option value="applicant">{t.badges.applicant}</option>
          </select>
        ) : <RoleBadge role={item.role} />,
    },
    {
      key: 'company',
      header: t.admin.colCompany,
      render: (item) =>
        editId === item.id ? (
          <input value={editData.company_name || ''} onChange={(e) => setEditData((d) => ({ ...d, company_name: e.target.value }))}
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm" />
        ) : <span className="text-muted-foreground">{item.company_name || '-'}</span>,
    },
    {
      key: 'status',
      header: t.admin.colStatus,
      render: (item) =>
        editId === item.id ? (
          <select value={editData.status || 'active'} onChange={(e) => setEditData((d) => ({ ...d, status: e.target.value as Profile['status'] }))}
            className="rounded border border-gray-300 px-2 py-1 text-sm">
            <option value="active">{t.badges.active}</option>
            <option value="inactive">{t.badges.inactive}</option>
            <option value="pending">{t.badges.pending}</option>
          </select>
        ) : <RoleBadge role={item.status} />,
    },
    {
      key: 'created',
      header: t.admin.colCreated,
      render: (item) => (
        <span className="text-muted-foreground">
          {formatDate(item.created_at, {
            month: 'short', day: 'numeric', year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t.admin.colActions,
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
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => setDeleting(item)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ),
    },
  ], [t, formatDate, editId, editData, saveEdit, startEdit]);

  if (!isHydrated) {
    return (
      <PageLoading />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-foreground">{t.admin.userManagement}</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-[hsl(210,100%,45%)]/10 text-[hsl(210,100%,45%)] border border-[hsl(210,100%,45%)]/20">
            {profiles.length}
          </span>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="gap-2">
          <Plus className="w-4 h-4" />
          {t.admin.createUserBtn}
        </Button>
      </div>

      {showCreate && (
        <CreateUserForm onSave={(p) => { sync([...profiles, p]); setShowCreate(false); }} onCancel={() => setShowCreate(false)} />
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={t.admin.searchUsersPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)] bg-white"
        />
      </div>

      <DataTable columns={columns} data={filtered} pageSize={10} emptyMessage={t.admin.noUsersMatch} />

      {deleting && (
        <DeleteAccountDialog
          open={!!deleting}
          onOpenChange={(open) => !open && setDeleting(null)}
          targetLabel={t.admin.userAccountLabel.replace('{name}', deleting.full_name)}
          confirmText={deleting.email}
          onConfirm={() => deleteUser(deleting.id)}
        />
      )}
    </div>
  );
}

function CreateUserForm({ onSave, onCancel }: { onSave: (p: Profile) => void; onCancel: () => void }) {
  const { t } = useT();
  const [data, setData] = useState({ full_name: '', email: '', password: '', role: 'applicant' as Profile['role'], status: 'active' as Profile['status'], company_name: '' });
  const [accessMode, setAccessMode] = useState<'invite' | 'password'>('invite');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const handleCreate = async () => {
    if (demoGuard('create a user')) return;
    if (!data.full_name.trim() || !data.email.trim()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      setCreateError(t.errors.invalidEmail);
      return;
    }
    if (accessMode === 'password' && data.password.length < 8) {
      setCreateError(t.errors.passwordTooShort);
      return;
    }
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
        password: accessMode === 'password' ? data.password : '',
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      setCreateError(err.error || t.errors.failedToCreateUser);
      setCreating(false);
      return;
    }

    onSave(profile);
    setCreating(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-foreground">{t.admin.createNewUserModalTitle}</h3>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onCancel}><X className="w-4 h-4" /></Button>
      </div>
      {createError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">{createError}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t.admin.fullNameLabel}</label>
          <input type="text" placeholder={t.admin.enterFullName} value={data.full_name}
            onChange={(e) => setData((d) => ({ ...d, full_name: e.target.value }))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t.admin.colEmail}</label>
          <input type="email" placeholder={t.admin.enterEmailAddress} value={data.email}
            onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)]" />
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-foreground mb-1.5">{t.admin.accessLabel}</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 cursor-pointer text-sm ${accessMode === 'invite' ? 'border-[hsl(210,100%,45%)] bg-[hsl(210,100%,45%)]/5' : 'border-gray-200'}`}>
              <input type="radio" name="accessMode" className="mt-1" checked={accessMode === 'invite'} onChange={() => setAccessMode('invite')} />
              <span>
                <span className="block font-medium text-foreground">{t.admin.sendInviteEmail}</span>
                <span className="block text-muted-foreground">{t.admin.sendInviteEmailDesc}</span>
              </span>
            </label>
            <label className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 cursor-pointer text-sm ${accessMode === 'password' ? 'border-[hsl(210,100%,45%)] bg-[hsl(210,100%,45%)]/5' : 'border-gray-200'}`}>
              <input type="radio" name="accessMode" className="mt-1" checked={accessMode === 'password'} onChange={() => setAccessMode('password')} />
              <span>
                <span className="block font-medium text-foreground">{t.admin.setPasswordMyself}</span>
                <span className="block text-muted-foreground">{t.admin.setPasswordMyselfDesc}</span>
              </span>
            </label>
          </div>
        </div>
        {accessMode === 'password' && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t.auth.passwordLabel}</label>
            <input type="text" placeholder={t.admin.atLeast8Chars} value={data.password}
              onChange={(e) => setData((d) => ({ ...d, password: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)]" />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t.admin.colRole}</label>
          <select value={data.role} onChange={(e) => setData((d) => ({ ...d, role: e.target.value as Profile['role'] }))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)]">
            <option value="admin">{t.badges.admin}</option>
            <option value="applicant">{t.badges.applicant}</option>
            <option value="employer">{t.badges.employer}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t.admin.colStatus}</label>
          <select value={data.status} onChange={(e) => setData((d) => ({ ...d, status: e.target.value as Profile['status'] }))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)]">
            <option value="active">{t.badges.active}</option>
            <option value="inactive">{t.badges.inactive}</option>
            <option value="pending">{t.badges.pending}</option>
          </select>
        </div>
        {data.role === 'employer' && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t.admin.companyNameLabel}</label>
            <input type="text" placeholder={t.admin.enterCompanyName} value={data.company_name}
              onChange={(e) => setData((d) => ({ ...d, company_name: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)]" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Button className="gap-2" disabled={creating} onClick={handleCreate}>
          {creating ? t.admin.creatingUser : <><Plus className="w-4 h-4" /> {t.admin.createBtn}</>}
        </Button>
        <Button variant="outline" onClick={onCancel}>{t.common.cancel}</Button>
      </div>
    </div>
  );
}
