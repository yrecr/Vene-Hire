const roleStyles: Record<string, string> = {
  admin: 'bg-orange-50 text-orange-700 border-orange-200',
  employer: 'bg-blue-50 text-blue-700 border-blue-200',
  applicant: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  contacted: 'bg-blue-50 text-blue-700 border-blue-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive: 'bg-gray-100 text-gray-600 border-gray-200',
  upcoming: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  enrolled: 'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  dropped: 'bg-red-50 text-red-700 border-red-200',
};

interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const style = roleStyles[role] || 'bg-gray-100 text-gray-600 border-gray-200';
  const label = role.replace('_', ' ');
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border capitalize ${style}`}>
      {label}
    </span>
  );
}
