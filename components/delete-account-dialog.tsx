'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TriangleAlert } from 'lucide-react';
import { demoGuard } from '@/lib/demo';
import { useT } from '@/lib/i18n';

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetLabel: string;
  confirmText: string;
  onConfirm: () => Promise<void>;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
  targetLabel,
  confirmText,
  onConfirm,
}: DeleteAccountDialogProps) {
  const { t } = useT();
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = typed.trim() === confirmText && !deleting;

  const handleConfirm = async () => {
    if (demoGuard('delete an account')) return;
    setDeleting(true);
    setError(null);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.somethingWentWrong);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!deleting) {
          onOpenChange(next);
          setTyped('');
          setError(null);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <TriangleAlert className="w-5 h-5" />
            {t.modals.deleteAccountTitle.replace('{target}', targetLabel)}
          </DialogTitle>
          <DialogDescription>{t.modals.deleteAccountDesc}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="delete-confirm-input">
            {t.modals.typeToConfirm.split('{confirmText}')[0]}
            <span className="font-mono font-semibold text-foreground">{confirmText}</span>
            {t.modals.typeToConfirm.split('{confirmText}')[1] || ''}
          </Label>
          <Input
            id="delete-confirm-input"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleting}>
            {t.common.cancel}
          </Button>
          <Button variant="destructive" disabled={!canDelete} onClick={handleConfirm}>
            {deleting ? t.common.deleting : t.modals.confirmDeleteBtn}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
