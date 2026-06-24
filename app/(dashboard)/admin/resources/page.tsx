'use client';

import { DataTable, type DataTableColumn } from '@/components/data-table';
import { RoleBadge } from '@/components/role-badge';
import { Button } from '@/components/ui/button';
import { useMockData } from '@/lib/data-context';
import { Plus } from 'lucide-react';
import type { Resource } from '@/types';

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
    render: (item) => <RoleBadge role={item.visibility} />,
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

export default function ResourcesPage() {
  const { resources } = useMockData();
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Resources</h2>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Upload Resource
        </Button>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={resources} />
    </div>
  );
}
