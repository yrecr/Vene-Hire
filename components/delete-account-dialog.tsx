'use client';

import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TriangleAlert } from 'lucide-react';

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** What the dialog is deleting — an email/name shown as "Delete Sofia's account?". */
  targetLabel: string;
  /** The exact text the user must type to enable the delete button (their email works well — unambiguous, they always know it). */
  confirmText: string;
  onConfirm: () => Promise<void>;
}

/**
 * Shared typed-confirmation dialog for account deletion — used both for an
 * admin deleting someone else's account and for a user deleting their own.
 * A plain confirm() is too easy to click through by habit for something
 * this irreversible.
 */
export function DeleteAccountDialog({ open, onOpenChange, targetLabel, confirmText, onConfirm }: DeleteAccountDialogProps) {
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = typed.trim() === confirmText && !deleting;

  const handleConfirm = async () => {
    setDeleting(true);
    setError(null);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!deleting) { onOpenChange(next); setTyped(''); setError(null); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <TriangleAlert className="w-5 h-5" />
            Delete {targetLabel}?
          </DialogTitle>
          <DialogDescription>
            This permanently deletes the account and everything tied to it — profile, processes, interviews, and history. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="delete-confirm-input">
            Type <span className="font-mono font-semibold text-foreground">{confirmText}</span> to confirm
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
            Cancel
          </Button>
          <Button variant="destructive" disabled={!canDelete} onClick={handleConfirm}>
            {deleting ? 'Deleting...' : 'Delete permanently'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
