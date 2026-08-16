'use client';

import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';

const companyInfo = [
  { label: 'Company Name', value: 'TechCorp Inc.' },
  { label: 'Contact', value: 'John Smith' },
  { label: 'Email', value: 'john@techcorp.com' },
  { label: 'Country', value: 'United States' },
  { label: 'Industry', value: 'Technology' },
  { label: 'Team Size', value: '50-200' },
];

export default function ClientCompanyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Company Profile</h2>
          <p className="text-muted-foreground mt-1">
            Your organization details on the platform.
          </p>
        </div>
        <Button variant="outline">Edit Profile</Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center">
            <Building2 className="w-7 h-7 text-[hsl(210,100%,45%)]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">TechCorp Inc.</h3>
            <p className="text-sm text-muted-foreground">Technology</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {companyInfo.map((item) => (
            <div key={item.label}>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                {item.label}
              </p>
              <p className="text-sm font-medium text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
