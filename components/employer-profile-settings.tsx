'use client';

import { useEffect, useState } from 'react';
import { Building2, Pencil, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data-context';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { demoGuard } from '@/lib/demo';
import { useT } from '@/lib/i18n';

export function EmployerProfileSettings() {
  const { currentUser } = useAuth();
  const { employerProfiles } = useData();
  const { t, lang, formatDate } = useT();
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
    if (demoGuard('Save company profile')) return;
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

  const statusLabel =
    (t.badges as Record<string, string>)[employerProfile?.status || 'active'] ||
    employerProfile?.status ||
    'active';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{t.employer.settingsTitle}</h3>
          <p className="text-sm text-muted-foreground">
            {lang === 'es'
              ? 'Administra la información de tu empresa y preferencias de contratación.'
              : 'Manage your company information and hiring preferences.'}
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
            {t.common.edit}
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
              {t.common.cancel}
            </Button>
            <Button
              size="sm"
              className="gap-1.5 bg-[hsl(210,100%,45%)] hover:bg-[hsl(210,100%,40%)]"
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="w-4 h-4" />
              {saving ? t.common.saving : t.common.save}
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
              {companyName || (lang === 'es' ? 'Nombre de Empresa' : 'Company Name')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {lang === 'es' ? 'Contacto:' : 'Contact:'} {contactName || (lang === 'es' ? 'No asignado' : 'Not set')}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t.auth.companyName}
            </label>
            {isEditing ? (
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={t.auth.companyPlaceholder}
              />
            ) : (
              <p className="text-sm text-muted-foreground bg-gray-50 rounded-lg px-3 py-2.5">
                {companyName || (lang === 'es' ? 'No asignado' : 'Not set')}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {lang === 'es' ? 'Nombre de Contacto' : 'Contact Name'}
            </label>
            {isEditing ? (
              <Input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Jane Doe"
              />
            ) : (
              <p className="text-sm text-muted-foreground bg-gray-50 rounded-lg px-3 py-2.5">
                {contactName || (lang === 'es' ? 'No asignado' : 'Not set')}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {lang === 'es' ? 'Resumen de la Empresa' : 'Company Summary'}
            </label>
            {isEditing ? (
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder={lang === 'es' ? 'Describe tu empresa...' : 'Describe your company...'}
                rows={4}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)] resize-none"
              />
            ) : (
              <p className="text-sm text-muted-foreground bg-gray-50 rounded-lg px-3 py-2.5 whitespace-pre-wrap">
                {summary || (lang === 'es' ? 'Sin descripción proporcionada.' : 'No summary provided.')}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t.auth.hiringNeedLabel}
            </label>
            {isEditing ? (
              <textarea
                value={hiringNeeds}
                onChange={(e) => setHiringNeeds(e.target.value)}
                placeholder={t.auth.hiringNeedPlaceholder}
                rows={3}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)] resize-none"
              />
            ) : (
              <p className="text-sm text-muted-foreground bg-gray-50 rounded-lg px-3 py-2.5 whitespace-pre-wrap">
                {hiringNeeds || (lang === 'es' ? 'Sin necesidades especificadas.' : 'No hiring needs specified.')}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {lang === 'es' ? 'Método de Pago' : 'Payment Method'}
            </label>
            {isEditing ? (
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)]"
              >
                <option value="">{lang === 'es' ? 'No asignado' : 'Not set'}</option>
                <option value="deal">DEAL</option>
                <option value="bank_transfer">{lang === 'es' ? 'Transferencia bancaria' : 'Bank transfer'}</option>
                <option value="other">{lang === 'es' ? 'Otro' : 'Other'}</option>
              </select>
            ) : (
              <p className="text-sm text-muted-foreground bg-gray-50 rounded-lg px-3 py-2.5 capitalize">
                {employerProfile?.payment_method?.replace('_', ' ') || (lang === 'es' ? 'No asignado' : 'Not set')}
              </p>
            )}
          </div>

          {(isEditing || paymentDetails) && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {lang === 'es' ? 'Detalles de Pago' : 'Payment Details'}
                <span className="text-muted-foreground font-normal"> ({t.common.optional})</span>
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
              {lang === 'es' ? 'Estado de la Cuenta' : 'Account Status'}
            </label>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 capitalize">
                {statusLabel}
              </span>
              <span className="text-xs text-muted-foreground">
                {lang === 'es' ? 'Miembro desde ' : 'Member since '}
                {employerProfile
                  ? formatDate(employerProfile.created_at, { month: 'long', year: 'numeric' })
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
