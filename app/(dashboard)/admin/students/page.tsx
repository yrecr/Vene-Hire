'use client';

import { RoleBadge } from '@/components/role-badge';

const mockStudents = [
  {
    id: 's1',
    name: 'Maria Gonzalez',
    email: 'maria@email.com',
    bootcamp: 'Full Stack Web Development - Cohort 12',
    progress: 65,
    status: 'in_progress',
  },
  {
    id: 's2',
    name: 'Carlos Silva',
    email: 'carlos@email.com',
    bootcamp: 'Backend Engineering - Cohort 8',
    progress: 30,
    status: 'enrolled',
  },
  {
    id: 's3',
    name: 'Ana Martinez',
    email: 'ana@email.com',
    bootcamp: 'Full Stack Web Development - Cohort 12',
    progress: 100,
    status: 'completed',
  },
];

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="text-2xl font-bold text-foreground">Students</h2>

      {/* Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockStudents.map((student) => (
          <div
            key={student.id}
            className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">{student.name}</h3>
                <p className="text-sm text-muted-foreground">{student.email}</p>
              </div>
              <RoleBadge role={student.status} />
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              <span className="font-medium text-foreground/80">Bootcamp:</span>{' '}
              {student.bootcamp}
            </p>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-foreground">{student.progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[hsl(210,100%,45%)] to-[hsl(170,60%,42%)] transition-all duration-500"
                  style={{ width: `${student.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
