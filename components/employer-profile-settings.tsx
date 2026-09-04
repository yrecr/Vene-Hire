'use client';

import { useEffect, useState } from 'react';
import { Building2, Pencil, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data-context';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

export function EmployerProfileSettings() {
  const { currentUser } = useAuth();
  const { employerProfiles } = useData();
  const [saving, setSaving] = useState(false);

  const employerProfile = employerProfiles.find((e) => e.id === currentUser?.employer_profile_id);

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
  const [paymentMethod, setPaymentMethod] = useState(employerProfile?.payment_method || '');
  const [paymentDetails, setPaymentDetails] = useState(employerProfile?.payment_details || '');

  // employerProfile arrives asynchronously (data-context hydrates after mount) —
  // resync local fields once it loads, but never clobber an in-progress edit.
  useEffect(() => {
    if (isEditing || !employerProfile) return;
    setCompanyName(employerProfile.company_name || '');
    setContactName(employerProfile.contact_name || '');
    setSummary(employerProfile.summary || '');
    setHiringNeeds(employerProfile.hiring_needs || '');
    setPaymentMethod(employerProfile.payment_method || '');
    setPaymentDetails(employerProfile.payment_details || '');
  }, [employerProfile, isEditing]);

  const handleSave = async () => {
    if (!employerProfile) return;
    setSaving(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.from('employer_profiles').update({
      company_name: companyName,
      contact_name: contactName,
      summary,
      hiring_needs: hiringNeeds,
      payment_method: paymentMethod || null,
      payment_details: paymentDetails || null,
    }).eq('id', employerProfile.id);
    setSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCompanyName(employerProfile?.company_name || '');
    setContactName(employerProfile?.contact_name || '');
    setSummary(employerProfile?.summary || '');
    setHiringNeeds(employerProfile?.hiring_needs || '');
    setPaymentMethod(employerProfile?.payment_method || '');
    setPaymentDetails(employerProfile?.payment_details || '');
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Company Profile</h3>
          <p className="text-sm text-muted-foreground">Manage your company information and hiring preferences.</p>
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
              disabled={saving}
            >
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
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

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Payment Method
            </label>
            {isEditing ? (
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)]"
              >
                <option value="">Not set</option>
                <option value="deal">DEAL</option>
                <option value="bank_transfer">Bank transfer</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <p className="text-sm text-muted-foreground bg-gray-50 rounded-lg px-3 py-2.5 capitalize">
                {employerProfile?.payment_method?.replace('_', ' ') || 'Not set'}
              </p>
            )}
          </div>

          {(isEditing || paymentDetails) && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Payment Details
                <span className="text-muted-foreground font-normal"> (optional)</span>
              </label>
              {isEditing ? (
                <Input
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                  placeholder="e.g. bank name, account details, or notes"
                />
              ) : (
                <p className="text-sm text-muted-foreground bg-gray-50 rounded-lg px-3 py-2.5">
                  {paymentDetails}
                </p>
              )}
            </div>
          )}

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
