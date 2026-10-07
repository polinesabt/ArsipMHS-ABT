import { useState } from 'react';
import { DatabaseZap, Loader2 } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useOptionalDemoDummyData } from '@/contexts/DemoDummyDataContext';
import { cn } from '@/lib/utils';

interface DemoDummyDataButtonProps {
  className?: string;
  buttonVariant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  fullWidth?: boolean;
}

export function DemoDummyDataButton({
  className,
  buttonVariant = 'outline',
  size = 'sm',
  fullWidth = false,
}: DemoDummyDataButtonProps) {
  const demoDummy = useOptionalDemoDummyData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  if (!demoDummy?.target) return null;
  const { target, isGenerating } = demoDummy;

  const handleConfirm = async () => {
    try {
      const generated = await demoDummy.generate();
      setOpen(false);
      toast({
        title: 'Data dummy ditambahkan',
        description: generated.message,
      });
    } catch (error) {
      toast({
        title: 'Gagal menambahkan data dummy',
        description: error instanceof Error ? error.message : 'Penyimpanan sandbox gagal.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isGenerating && setOpen(next)}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          size={size}
          variant={buttonVariant}
          disabled={isGenerating}
          className={cn(fullWidth && 'w-full justify-start', className)}
          title={`Tambah data dummy untuk ${target.label}`}
        >
          {isGenerating ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <DatabaseZap className="mr-1.5 h-3.5 w-3.5" />}
          {isGenerating ? 'Menambahkan...' : 'Tambah Data Dummy'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tambah data dummy?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block font-medium text-foreground">Modul: {target.label}</span>
            <span className="block">{target.description}</span>
            <span className="block">Data hanya tersimpan di browser selama sesi Demo Mode dan dapat dibersihkan melalui tombol Reset.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isGenerating}>Batal</AlertDialogCancel>
          <Button type="button" onClick={() => void handleConfirm()} disabled={isGenerating}>
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isGenerating ? 'Menambahkan...' : 'Ya, Tambahkan'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
