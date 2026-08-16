'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Pen, Upload, Loader2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { SelectionProcess } from '@/types';
import { removeBg } from '@/lib/signature';

interface Props {
  open: boolean;
  onClose: () => void;
  process: SelectionProcess | null;
  onSign: (processId: string, signatureBlob: Blob) => Promise<void>;
}

export function ContractSigningModal({ open, onClose, process, onSign }: Props) {
  const [mode, setMode] = useState<'view' | 'sign' | 'submitting'>('view');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sigBlobRef = useRef<Blob | null>(null);
  const [sigPreviewUrl, setSigPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) { setMode('view'); setSigPreviewUrl(null); sigBlobRef.current = null; }
  }, [open]);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const blob = await removeBg(file);
      sigBlobRef.current = blob;
      setSigPreviewUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error('[sign] process error:', err);
    }
    e.target.value = '';
  }, []);

  const clearSignature = useCallback(() => {
    sigBlobRef.current = null;
    if (sigPreviewUrl) URL.revokeObjectURL(sigPreviewUrl);
    setSigPreviewUrl(null);
  }, [sigPreviewUrl]);

  const handleSubmit = useCallback(async () => {
    if (!process || !sigBlobRef.current) return;
    setMode('submitting');
    await onSign(process.id, sigBlobRef.current);
    onClose();
  }, [process, onSign, onClose]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Contract Signing</DialogTitle>
          <DialogDescription>
            {process?.role_title} — {process?.employer?.company_name || ''}
          </DialogDescription>
        </DialogHeader>

        {mode === 'submitting' ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Submitting your signature...</p>
          </div>
        ) : mode === 'sign' ? (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <strong>Upload your signature image</strong>. The white background will be removed automatically.
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
            {sigPreviewUrl ? (
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-xl p-4 bg-white flex items-center justify-center">
                  <img src={sigPreviewUrl} alt="Signature preview" className="max-h-24 object-contain" />
                </div>
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={clearSignature}>
                    <X className="w-3.5 h-3.5 mr-1" /> Remove
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setMode('view')}>Cancel</Button>
                    <Button onClick={handleSubmit} className="gap-2">
                      <Upload className="w-4 h-4" /> Confirm Signature
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full py-12 border-dashed"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-5 h-5 mr-2" />
                Select signature image
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {process?.contract_url ? (
              <iframe
                src={process.contract_url}
                className="w-full h-[500px] rounded-xl border border-gray-200"
              />
            ) : (
              <div className="bg-gray-50 rounded-xl p-12 text-center text-muted-foreground">
                Contract PDF not available yet.
              </div>
            )}
            {process?.contract_status === 'pending' && (
              <div className="flex justify-end">
                <Button onClick={() => setMode('sign')} className="gap-2">
                  <Pen className="w-4 h-4" /> Firmar
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
