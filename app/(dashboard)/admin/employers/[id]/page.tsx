'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useData } from '@/lib/data-context';
import { RoleBadge } from '@/components/role-badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2 } from 'lucide-react';

export default function AdminEmployerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { getEmployerById } = useData();

  const employer = getEmployerById(id);

  if (!employer) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Employer not found</h1>
          <p className="text-gray-500 mb-8">
            The employer profile you are looking for does not exist or has been removed.
          </p>
          <Link href="/admin/employers">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Employers
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <div className="mb-6">
        <Link href="/admin/employers">
          <Button variant="ghost" className="gap-2 text-gray-600 hover:text-gray-900 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Employers
          </Button>
        </Link>
      </div>

      <section className="bg-gray-50 border border-gray-100 rounded-2xl">
        <div className="px-6 py-10 md:px-10 md:py-12">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-lg ring-4 ring-white flex items-center justify-center shrink-0">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {employer.company_name}
              </h1>
              <p className="text-lg text-gray-600 mb-4">{employer.contact_name}</p>
              <RoleBadge role={employer.status} />
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Hiring Needs</h2>
          <p className="text-gray-600 leading-relaxed">{employer.hiring_needs}</p>
        </div>

        {employer.summary && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
            <p className="text-gray-600 leading-relaxed">{employer.summary}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Details</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Status</dt>
              <dd><RoleBadge role={employer.status} /></dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Created</dt>
              <dd className="text-foreground">
                {new Date(employer.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
