'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends { id: string }>({ columns, data, onRowClick }: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/70 hover:bg-gray-50/70">
              {columns.map((col) => (
                <TableHead key={col.key} className={`text-xs font-semibold uppercase tracking-wider text-muted-foreground ${col.className || ''}`}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow
                key={item.id}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50/70' : ''}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.render(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
