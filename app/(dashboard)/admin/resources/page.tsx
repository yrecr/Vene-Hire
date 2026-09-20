'use client';

import { useState, useMemo } from 'react';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { PageLoading } from '@/components/page-loading';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { useData } from '@/lib/data-context';
import { useT } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import type { Resource } from '@/types';

const visibilityOptions: Resource['visibility'][] = ['all', 'admin', 'employer', 'applicant'];

function getFileType(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'PDF';
    case 'doc':
    case 'docx':
      return 'Document';
    case 'xls':
    case 'xlsx':
      return 'Spreadsheet';
    case 'ppt':
    case 'pptx':
      return 'Presentation';
    case 'mp4':
    case 'mov':
      return 'Video';
    case 'png':
    case 'jpg':
    case 'jpeg':
      return 'Image';
    default:
      return ext?.toUpperCase() || 'File';
  }
}

const selectClassName =
  'rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs capitalize focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)]';

export default function ResourcesPage() {
  const { t, formatDate } = useT();
  const { resources, bootcamps, isHydrated, createResource, updateResourceVisibility } = useData();
  const { toast } = useToast();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<Resource['visibility']>('all');
  const [bootcampId, setBootcampId] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setVisibility('all');
    setBootcampId('');
    setFile(null);
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) return;
    setSubmitting(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title.trim());
    formData.append('description', description);
    formData.append('visibility', visibility);
    if (bootcampId) formData.append('bootcamp_id', bootcampId);
    try {
      await createResource(formData);
      toast({ title: t.admin.resourceUploadedToast });
      setUploadOpen(false);
      resetForm();
    } catch {
      toast({ title: t.errors.uploadFailed, description: t.common.tryAgain, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVisibilityChange = async (id: string, next: Resource['visibility']) => {
    try {
      await updateResourceVisibility(id, next);
    } catch {
      toast({ title: t.admin.failedUpdateVisibilityToast, description: t.common.tryAgain, variant: 'destructive' });
    }
  };

  const columns: DataTableColumn<Resource>[] = useMemo(() => [
    {
      key: 'title',
      header: t.admin.colTitle,
      render: (item) => <span className="font-medium text-foreground">{item.title}</span>,
    },
    {
      key: 'description',
      header: t.admin.colDescription,
      render: (item) => (
        <span className="text-muted-foreground line-clamp-1 max-w-xs">
          {item.description}
        </span>
      ),
    },
    {
      key: 'visibility',
      header: t.admin.resourceVisibilityLabel,
      render: (item) => (
        <select
          value={item.visibility}
          onChange={(e) => handleVisibilityChange(item.id, e.target.value as Resource['visibility'])}
          className={selectClassName}
        >
          {visibilityOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt === 'all' ? t.admin.tabAll : (t.badges as Record<string, string>)[opt] || opt}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'type',
      header: t.admin.colType,
      render: (item) => (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700">
          {getFileType(item.file_path)}
        </span>
      ),
    },
    {
      key: 'date',
      header: t.admin.colDate,
      render: (item) => (
        <span className="text-muted-foreground">
          {formatDate(item.created_at, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
  ], [t, formatDate]);

  if (!isHydrated) {
    return (
      <PageLoading />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-foreground">{t.admin.resources}</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            {t.admin.betaBadge}
          </span>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setUploadOpen(true)}>
          <Plus className="w-4 h-4" />
          {t.admin.uploadResourceBtn}
        </Button>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={resources} pageSize={10} emptyMessage={t.admin.noResourcesUploaded} />

      {/* Upload dialog */}
      <Dialog open={uploadOpen} onOpenChange={(open) => { setUploadOpen(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.admin.uploadResourceModalTitle}</DialogTitle>
            <DialogDescription>{t.admin.uploadResourceModalDesc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.admin.filePdfLabel}</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.admin.resourceTitleLabel}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)]"
                placeholder={t.admin.resourceTitlePlaceholder}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.admin.resourceDescLabel}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)]"
                rows={3}
                placeholder={t.admin.resourceDescPlaceholder}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.admin.resourceVisibilityLabel}</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as Resource['visibility'])}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm capitalize focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)]"
                >
                  {visibilityOptions.map((opt) => (
                    <option key={opt} value={opt} className="capitalize">
                      {opt === 'all' ? t.admin.tabAll : (t.badges as Record<string, string>)[opt] || opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.admin.bootcampOptionalLabel}</label>
                <select
                  value={bootcampId}
                  onChange={(e) => setBootcampId(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)]"
                >
                  <option value="">{t.admin.noneOption}</option>
                  {bootcamps.map((bc) => (
                    <option key={bc.id} value={bc.id}>{bc.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setUploadOpen(false)} disabled={submitting}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleUpload} disabled={submitting || !file || !title.trim()}>
              {submitting ? t.admin.uploadingBtn : t.admin.uploadBtn}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
