'use client';

import { useMemo } from 'react';
import { Signature as FileSignature, Clock, CircleCheck as CheckCircle2, Eye } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data-context';
import { ProcessStatusBadge } from '@/components/process-status-badge';

export default function ApplicantContractPage() {
  const { currentUser } = useAuth();
  const { selectionProcesses, talentProfiles, employerProfiles } = useData();
  const user = currentUser;

  const talentProfile = useMemo(function () {
    if (user?.talent_profile_id) {
      const found = talentProfiles.find(function (t) { return t.id === user.talent_profile_id; });
      if (found) return found;
    }
    if (user?.profile_id) {
      const found = talentProfiles.find(function (t) { return t.user_id === user.profile_id; });
      if (found) return found;
    }
    return null;
  }, [user, talentProfiles]);

  const contractProcesses = useMemo(function () {
    if (!talentProfile) return [];
    return selectionProcesses.filter(function (p) {
      return p.applicant_id === talentProfile.id && p.current_stage === 'contract_signing';
    });
  }, [talentProfile, selectionProcesses]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Please sign in</h2>
          <p className="text-muted-foreground">Sign in with an applicant account to view your contracts.</p>
        </div>
      </div>
    );
  }

  function getContractIcon(contractStatus: string | null) {
    if (contractStatus === 'signed') {
      return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
    }
    if (contractStatus === 'under_review') {
      return <Eye className="w-6 h-6 text-blue-500" />;
    }
    return <Clock className="w-6 h-6 text-amber-500" />;
  }

  function getContractMessage(contractStatus: string | null) {
    if (contractStatus === 'signed') {
      return 'Contract has been signed. You are all set!';
    }
    if (contractStatus === 'under_review') {
      return 'Your contract is currently under review. You will be notified once it is ready for signing.';
    }
    return 'A contract is being prepared for you. Please check back soon.';
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Contract</h2>
        <p className="text-muted-foreground mt-1">
          View and manage your contract offers from employers.
        </p>
      </div>

      {contractProcesses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center mx-auto mb-4">
            <FileSignature className="w-7 h-7 text-[hsl(210,100%,45%)]" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No active contracts</h3>
          <p className="text-sm text-muted-foreground">
            When a hiring process reaches the contract stage, the details will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {contractProcesses.map(function (process) {
            var employer = employerProfiles.find(function (e) {
              return e.id === process.employer_id;
            });

            return (
              <div
                key={process.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center shrink-0">
                      {getContractIcon(process.contract_status)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-lg">{process.role_title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {employer?.company_name || 'Unknown Company'}
                      </p>
                    </div>
                  </div>
                  <ProcessStatusBadge status={process.contract_status || 'pending'} />
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-sm text-muted-foreground">
                    {getContractMessage(process.contract_status)}
                  </p>
                </div>

                {/* Contract details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Employer</p>
                    <p className="font-medium text-foreground">{employer?.company_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Contact</p>
                    <p className="font-medium text-foreground">{employer?.contact_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Role</p>
                    <p className="font-medium text-foreground">{process.role_title}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Contract Status</p>
                    <p className="font-medium text-foreground capitalize">
                      {(process.contract_status || 'pending').replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>

                {process.notes && (
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Notes:</span> {process.notes}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
