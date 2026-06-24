'use client';

import { useState } from 'react';
import { Building2, Pencil, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDemoAuth } from '@/lib/demo-auth';
import { getEmployerById, loadEmployerProfiles } from '@/lib/employer-profiles';

export default function EmployerCompanyPage() {
  const { currentUser } = useDemoAuth();

  const employerProfile = getEmployerById(currentUser?.employer_profile_id) ?? loadEmployerProfiles()[0];

  const [isEditing, setIsEditing] = useState(false);
  const [companyName, setCompanyName] = useState(
    employerProfile?.company_name || ''
  );
  const [contactName, setContactName] = useState(
    employerProfile?.contact_name || ''
  );
  const [summary, setSummary] = useState(employerProfile?.summary || '');
  const [hiringNeeds, setHiringNeeds] = useState(
    employerProfile?.hiring_needs || ''
  );

  const handleSave = () => {
    alert('Company profile saved! (Demo mode - changes are not persisted)');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCompanyName(employerProfile?.company_name || '');
    setContactName(employerProfile?.contact_name || '');
    setSummary(employerProfile?.summary || '');
    setHiringNeeds(employerProfile?.hiring_needs || '');
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Company Profile
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage your company information and hiring preferences.
          </p>
        </div>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleCancel}
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              size="sm"
              className="gap-1.5 bg-[hsl(210,100%,45%)] hover:bg-[hsl(210,100%,40%)]"
              onClick={handleSave}
            >
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        {/* Company header */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-[hsl(210,100%,45%)]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">
              {companyName || 'Company Name'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Contact: {contactName || 'Not set'}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Company Name */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Company Name
            </label>
            {isEditing ? (
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
              />
            ) : (
              <p className="text-sm text-muted-foreground bg-gray-50 rounded-lg px-3 py-2.5">
                {companyName || 'Not set'}
              </p>
            )}
          </div>

          {/* Contact Name */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Contact Name
            </label>
            {isEditing ? (
              <Input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Enter contact name"
              />
            ) : (
              <p className="text-sm text-muted-foreground bg-gray-50 rounded-lg px-3 py-2.5">
                {contactName || 'Not set'}
              </p>
            )}
          </div>

          {/* Summary */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Company Summary
            </label>
            {isEditing ? (
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Describe your company..."
                rows={4}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)] resize-none"
              />
            ) : (
              <p className="text-sm text-muted-foreground bg-gray-50 rounded-lg px-3 py-2.5 whitespace-pre-wrap">
                {summary || 'No summary provided.'}
              </p>
            )}
          </div>

          {/* Hiring Needs */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Hiring Needs
            </label>
            {isEditing ? (
              <textarea
                value={hiringNeeds}
                onChange={(e) => setHiringNeeds(e.target.value)}
                placeholder="Describe your current hiring needs..."
                rows={3}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)] resize-none"
              />
            ) : (
              <p className="text-sm text-muted-foreground bg-gray-50 rounded-lg px-3 py-2.5 whitespace-pre-wrap">
                {hiringNeeds || 'No hiring needs specified.'}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Account Status
            </label>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 capitalize">
                {employerProfile?.status || 'active'}
              </span>
              <span className="text-xs text-muted-foreground">
                Member since{' '}
                {employerProfile
                  ? new Date(employerProfile.created_at).toLocaleDateString(
                      'en-US',
                      { month: 'long', year: 'numeric' }
                    )
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
