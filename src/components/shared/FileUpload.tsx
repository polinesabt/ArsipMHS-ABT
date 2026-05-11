import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Upload, X, FileText, Image, File, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AchievementAttachment } from '@/types/achievement.types';

interface FileUploadProps {
  value?: AchievementAttachment[];
  onChange: (attachments: AchievementAttachment[]) => void;
  maxFiles?: number;
  maxSizeInMB?: number;
  accept?: string;
  className?: string;
}

export function FileUpload({
  value = [],
  onChange,
  maxFiles = 5,
  maxSizeInMB = 2,
  accept = 'image/*,.pdf,.doc,.docx',
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<AchievementAttachment | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<Record<string, string>>({});

  const generateId = () => `file_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  useEffect(() => {
    return () => {
      Object.values(previewUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current = {};
    };
  }, []);

  useEffect(() => {
    const activeIds = new Set(value.map((item) => item.id));
    Object.entries(previewUrlsRef.current).forEach(([id, url]) => {
      if (activeIds.has(id)) return;
      URL.revokeObjectURL(url);
      delete previewUrlsRef.current[id];
    });
  }, [value]);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType === 'application/pdf') return FileText;
    return File;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    setError(null);

    const newFiles: AchievementAttachment[] = [];
    const maxSize = maxSizeInMB * 1024 * 1024;

    Array.from(files).forEach((file) => {
      if (value.length + newFiles.length >= maxFiles) {
        setError(`Maksimal ${maxFiles} file`);
        return;
      }

      if (file.size > maxSize) {
        setError(`File "${file.name}" terlalu besar (maks ${maxSizeInMB}MB)`);
        return;
      }

      const attachmentId = generateId();
      const fileUrl = URL.createObjectURL(file);
      previewUrlsRef.current[attachmentId] = fileUrl;

      const attachment: AchievementAttachment = {
        id: attachmentId,
        attachmentId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl,
        uploadedAt: new Date().toISOString(),
        file,
        isPersisted: false,
      };
      newFiles.push(attachment);
    });

    if (newFiles.length > 0) {
      onChange([...value, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleRemove = (id: string) => {
    const trackedUrl = previewUrlsRef.current[id];
    if (trackedUrl) {
      URL.revokeObjectURL(trackedUrl);
      delete previewUrlsRef.current[id];
    }
    onChange(value.filter((f) => f.id !== id));
  };

  const confirmRemove = () => {
    if (!removeTarget) return;
    handleRemove(removeTarget.id);
    setRemoveTarget(null);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Upload Area */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/50',
          value.length >= maxFiles && 'opacity-50 pointer-events-none'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          onChange={(e) => processFiles(e.target.files)}
          className="hidden"
          disabled={value.length >= maxFiles}
        />
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {isDragging ? 'Lepas file di sini' : 'Upload Sertifikat / Dokumentasi'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Drag & drop atau klik untuk memilih file (maks {maxSizeInMB}MB)
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <X className="w-4 h-4" />
          {error}
        </p>
      )}

      {/* File List */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file) => {
            const Icon = getFileIcon(file.fileType);
            return (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {file.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.fileSize)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRemoveTarget(file);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* File Count Indicator */}
      <p className="text-xs text-muted-foreground text-right">
        {value.length} / {maxFiles} file
      </p>

      <AlertDialog
        open={removeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus lampiran?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget
                ? `Lampiran "${removeTarget.fileName}" akan dihapus dari form. Jika ini lampiran lama, penghapusan permanen diproses saat klik Simpan.`
                : 'Lampiran akan dihapus dari form.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmRemove}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
