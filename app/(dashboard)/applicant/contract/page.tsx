'use client';

import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { Signature as FileSignature, Clock, CircleCheck as CheckCircle2, Eye, FileDown, Pen, Upload, Eraser } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data-context';
import { ProcessStatusBadge } from '@/components/process-status-badge';
import { Button } from '@/components/ui/button';
import { removeBg } from '@/lib/signature';
import type { EmployerProfile, SelectionProcess } from '@/types';

export default function ApplicantContractPage() {
  const { currentUser } = useAuth();
  const { selectionProcesses, talentProfiles, employerProfiles, signContract } = useData();
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
        <div className="grid grid-cols-1 gap-6">
          {contractProcesses.map(function (process) {
            const employer = employerProfiles.find(function (e) {
              return e.id === process.employer_id;
            });
            return (
              <ContractCard
                key={process.id}
                process={process}
                employer={employer ?? null}
                signContract={signContract}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Contract Card with own signature state ───

function getContractIcon(contractStatus: string | null) {
  if (contractStatus === 'signed') { return <CheckCircle2 className="w-6 h-6 text-emerald-500" />; }
  if (contractStatus === 'under_review') { return <Eye className="w-6 h-6 text-blue-500" />; }
  if (contractStatus === 'pending') { return <Pen className="w-6 h-6 text-amber-500" />; }
  return <Clock className="w-6 h-6 text-amber-500" />;
}

function getContractMessage(contractStatus: string | null) {
  if (contractStatus === 'signed') { return 'Contract has been signed. You are all set!'; }
  if (contractStatus === 'under_review') { return 'Your signed contract is under review. You will be notified once it is approved.'; }
  if (contractStatus === 'pending') { return 'Your contract is ready. Review the document and sign below.'; }
  return 'A contract is being prepared for you. Please check back soon.';
}

/**
 * Draw-to-sign pad using the native Pointer Events API (mouse, touch, and pen
 * all fire the same events) — no signature-pad dependency needed. Canvas
 * starts fully transparent so toBlob('image/png') already matches the
 * transparent-background format removeBg() produces for uploaded images.
 */
function SignaturePad({ onConfirm }: { onConfirm: (blob: Blob) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Backing store at 2x for crisp strokes on high-DPI screens; CSS size stays logical.
    const ctx = canvas.getContext('2d')!;
    canvas.width = canvas.clientWidth * 2;
    canvas.height = canvas.clientHeight * 2;
    ctx.scale(2, 2);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e293b';
  }, []);

  const pointFromEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = pointFromEvent(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    drawingRef.current = true;
    setHasDrawn(true);
    canvasRef.current!.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = pointFromEvent(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => { drawingRef.current = false; };

  const clear = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const confirm = () => {
    canvasRef.current!.toBlob((b) => { if (b) onConfirm(b); }, 'image/png');
  };

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        className="w-full h-40 rounded-xl border border-gray-200 bg-white touch-none cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
      />
      <div className="flex gap-3">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={clear} disabled={!hasDrawn}>
          <Eraser className="w-3.5 h-3.5" />
          Clear
        </Button>
        <Button size="sm" className="bg-[hsl(210,100%,45%)] hover:bg-[hsl(210,100%,38%)]" disabled={!hasDrawn} onClick={confirm}>
          Use this signature
        </Button>
      </div>
    </div>
  );
}

function ContractCard({ process, employer, signContract }: {
  process: SelectionProcess;
  employer: EmployerProfile | null;
  signContract: (processId: string, blob: Blob) => Promise<void>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const blobRef = useRef<Blob | null>(null);
  const [signing, setSigning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mode, setMode] = useState<'upload' | 'draw'>('upload');

  const handleDrawn = useCallback((blob: Blob) => {
    blobRef.current = blob;
    setPreviewUrl(URL.createObjectURL(blob));
  }, []);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    try {
      const b = await removeBg(file);
      blobRef.current = b;
      setPreviewUrl(URL.createObjectURL(b));
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to process image');
      console.error('[sign] process error:', err);
    }
    e.target.value = '';
  }, []);

  const clearSig = useCallback(() => {
    blobRef.current = null;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }, [previewUrl]);

  const handleSign = useCallback(async () => {
    const b = blobRef.current;
    if (!b) return;
    setSigning(true);
    setErrorMsg(null);
    try {
      await signContract(process.id, b);
      clearSig();
    } catch (e: any) {
      const msg = e?.message || String(e);
      setErrorMsg(msg);
      console.error('[sign] error:', e);
    } finally {
      setSigning(false);
    }
  }, [process.id, signContract, clearSig]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
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

      <div className="grid grid-cols-2 gap-4 text-sm mb-5">
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

      {process.contract_url && (
        <div className="mb-5">
          <a href={process.contract_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(210,100%,45%)] text-white text-sm font-medium hover:bg-[hsl(210,100%,38%)] transition-colors"
          >
            <FileDown className="w-4 h-4" />
            View Contract PDF
          </a>
        </div>
      )}

      {process.contract_status === 'pending' && (
        <div className="border-t border-gray-100 pt-5">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload your signature
          </h4>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}
          {previewUrl ? (
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-xl p-4 bg-white flex items-center justify-center">
                <img src={previewUrl} alt="Signature preview" className="max-h-24 object-contain" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={clearSig}>Remove</Button>
                <Button size="sm" className="bg-[hsl(210,100%,45%)] hover:bg-[hsl(210,100%,38%)]"
                  disabled={signing} onClick={handleSign}>
                  {signing ? 'Signing...' : 'Sign Contract'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                <button
                  onClick={() => setMode('upload')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${mode === 'upload' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Upload image
                </button>
                <button
                  onClick={() => setMode('draw')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${mode === 'draw' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Draw signature
                </button>
              </div>

              {mode === 'upload' ? (
                <Button variant="outline" className="w-full py-8 border-dashed" onClick={() => fileRef.current?.click()}>
                  <Upload className="w-5 h-5 mr-2" />
                  Select signature image
                </Button>
              ) : (
                <SignaturePad onConfirm={handleDrawn} />
              )}
            </div>
          )}
        </div>
      )}

      {process.signature_url && (
        <div className="border-t border-gray-100 pt-4 mt-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">Your Signature</p>
          <img src={process.signature_url} alt="Signed signature"
            className="h-12 object-contain border border-gray-200 rounded-lg p-1 bg-white" />
        </div>
      )}

      {process.notes && (
        <div className="mt-5 pt-4 border-t border-gray-100">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Notes:</span> {process.notes}
          </p>
        </div>
      )}
    </div>
  );
}
