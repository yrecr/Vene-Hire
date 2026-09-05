'use client';

import { useState } from 'react';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { PageLoading } from '@/components/page-loading';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { useData } from '@/lib/data-context';
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
      toast({ title: 'Resource uploaded' });
      setUploadOpen(false);
      resetForm();
    } catch {
      toast({ title: 'Upload failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVisibilityChange = async (id: string, next: Resource['visibility']) => {
    try {
      await updateResourceVisibility(id, next);
    } catch {
      toast({ title: 'Failed to update visibility', description: 'Please try again.', variant: 'destructive' });
    }
  };

  const columns: DataTableColumn<Resource>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (item) => <span className="font-medium text-foreground">{item.title}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      render: (item) => (
        <span className="text-muted-foreground line-clamp-1 max-w-xs">
          {item.description}
        </span>
      ),
    },
    {
      key: 'visibility',
      header: 'Visibility',
      render: (item) => (
        <select
          value={item.visibility}
          onChange={(e) => handleVisibilityChange(item.id, e.target.value as Resource['visibility'])}
          className={selectClassName}
        >
          {visibilityOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (item) => (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700">
          {getFileType(item.file_path)}
        </span>
      ),
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
  ];

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
          <h2 className="text-2xl font-bold text-foreground">Resources</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Beta
          </span>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setUploadOpen(true)}>
          <Plus className="w-4 h-4" />
          Upload Resource
        </Button>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={resources} pageSize={10} emptyMessage="No resources uploaded yet." />

      {/* Upload dialog */}
      <Dialog open={uploadOpen} onOpenChange={(open) => { setUploadOpen(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Resource</DialogTitle>
            <DialogDescription>Add a new downloadable resource for the platform.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">File (PDF)</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)]"
                placeholder="Resource title"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)]"
                rows={3}
                placeholder="Short description"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Visibility</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as Resource['visibility'])}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm capitalize focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)]"
                >
                  {visibilityOptions.map((opt) => (
                    <option key={opt} value={opt} className="capitalize">{opt === 'all' ? 'All' : opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Bootcamp (optional)</label>
                <select
                  value={bootcampId}
                  onChange={(e) => setBootcampId(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)]"
                >
                  <option value="">None</option>
                  {bootcamps.map((bc) => (
                    <option key={bc.id} value={bc.id}>{bc.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setUploadOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={submitting || !file || !title.trim()}>
              {submitting ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
