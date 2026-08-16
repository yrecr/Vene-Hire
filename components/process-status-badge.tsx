const statusStyles: Record<string, string> = {
  active: 'bg-blue-50 text-blue-700 border-blue-200',
  hired: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  not_selected: 'bg-red-50 text-red-700 border-red-200',
  on_hold: 'bg-amber-50 text-amber-700 border-amber-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  under_review: 'bg-blue-50 text-blue-700 border-blue-200',
  signed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  intro_interview: 'bg-blue-50 text-primary border-blue-200',
  technical_interview: 'bg-teal-50 text-accent border-teal-200',
  contract_signing: 'bg-amber-50 text-amber-700 border-amber-200',
};

interface ProcessStatusBadgeProps {
  status: string;
}

export function ProcessStatusBadge({ status }: ProcessStatusBadgeProps) {
  const style = statusStyles[status] || 'bg-gray-100 text-gray-600 border-gray-200';
  const label = status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${style}`}
    >
      {label}
    </span>
  );
}
