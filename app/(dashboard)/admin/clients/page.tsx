'use client';

import { DataTable, type DataTableColumn } from '@/components/data-table';
import { RoleBadge } from '@/components/role-badge';

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  status: string;
  joined: string;
}

const mockClients: Client[] = [
  {
    id: 'c1',
    name: 'John Smith',
    company: 'TechCorp Inc.',
    email: 'john@techcorp.com',
    status: 'active',
    joined: '2024-02-01',
  },
  {
    id: 'c2',
    name: 'Sarah Johnson',
    company: 'StartupXYZ',
    email: 'sarah@startupxyz.io',
    status: 'active',
    joined: '2024-02-15',
  },
  {
    id: 'c3',
    name: 'Michael Brown',
    company: 'FinanceFlow',
    email: 'michael@financeflow.com',
    status: 'active',
    joined: '2024-03-01',
  },
  {
    id: 'c4',
    name: 'Lisa Chen',
    company: 'HealthTech Solutions',
    email: 'lisa@healthtech.com',
    status: 'inactive',
    joined: '2024-01-20',
  },
];

const columns: DataTableColumn<Client>[] = [
  {
    key: 'name',
    header: 'Name',
    render: (item) => <span className="font-medium text-foreground">{item.name}</span>,
  },
  {
    key: 'company',
    header: 'Company',
    render: (item) => <span className="text-muted-foreground">{item.company}</span>,
  },
  {
    key: 'email',
    header: 'Email',
    render: (item) => <span className="text-muted-foreground">{item.email}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (item) => <RoleBadge role={item.status} />,
  },
  {
    key: 'joined',
    header: 'Joined',
    render: (item) => (
      <span className="text-muted-foreground">
        {new Date(item.joined).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </span>
    ),
  },
];

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="text-2xl font-bold text-foreground">Clients</h2>

      {/* Table */}
      <DataTable columns={columns} data={mockClients} />
    </div>
  );
}
