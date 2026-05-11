/**
 * Delete Student Dialog
 * Confirmation dialog for moving student accounts to recycle bin
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface DeleteStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  studentNim: string;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteStudentDialog({
  open,
  onOpenChange,
  studentName,
  studentNim,
  onConfirm,
  isDeleting = false,
}: DeleteStudentDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle>Pindahkan Akun ke Recycle Bin?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3">
            <p>Anda akan memindahkan akun mahasiswa berikut ke Recycle Bin:</p>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-semibold text-foreground">{studentName}</p>
              <p className="text-sm text-muted-foreground">NIM: {studentNim}</p>
            </div>
            <p className="font-medium">
              Perhatian: Data terkait akan disembunyikan selama akun di Recycle Bin,
              dapat dipulihkan kapan saja, dan akan auto-purge setelah 30 hari.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Memindahkan...' : 'Ya, Pindahkan'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

