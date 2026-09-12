import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface PortalPageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: ReactNode;
  children?: ReactNode;
}

export function PortalPageHeader({ title, description, icon: Icon, action, children }: PortalPageHeaderProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-4 border-b border-border/75 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-medium text-primary">Portofolio Saya / {title}</p>
          <div className="flex items-start gap-3 sm:items-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="break-words text-xl font-bold tracking-tight sm:text-3xl">{title}</h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          </div>
        </div>
        {action && <div className="ui-mobile-actions flex w-full shrink-0 flex-wrap gap-2 [&>*]:flex-1 sm:w-auto sm:[&>*]:flex-none">{action}</div>}
      </div>
      {children}
    </div>
  );
}

export function DirectSaveNotice({ children = 'Data yang Anda simpan langsung digunakan pada dashboard pengelola program studi.' }: { children?: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/[0.06] px-4 py-3 text-xs leading-relaxed text-foreground">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <p>{children}</p>
    </div>
  );
}

export function UnsavedChangesNotice() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-xs leading-relaxed text-foreground" role="status">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
      <p>Anda memiliki perubahan yang belum disimpan.</p>
    </div>
  );
}

export function PortalFormSection({ id, title, description, children }: { id?: string; title: string; description: string; children: ReactNode }) {
  return (
    <div id={id} className="scroll-mt-28 border-b border-border/70 p-4 last:border-b-0 sm:p-6">
      <div className="mb-5">
        <h2 className="text-sm font-bold">{title}</h2>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}
