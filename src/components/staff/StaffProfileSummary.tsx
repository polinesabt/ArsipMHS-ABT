import { staffInitials } from '@/components/staff/staff-utils';

export interface StaffProfileFact {
  label: string;
  value?: string | number | null;
  mono?: boolean;
}

interface StaffProfileSummaryProps {
  name: string;
  identityLabel: string;
  identityValue: string;
  roleLabel: string;
  contextLabel: string;
  detailTitle: string;
  detailDescription: string;
  facts: StaffProfileFact[];
}

export function StaffProfileSummary({
  name,
  identityLabel,
  identityValue,
  roleLabel,
  contextLabel,
  detailTitle,
  detailDescription,
  facts,
}: StaffProfileSummaryProps) {
  return (
    <section className="mb-6 grid min-w-0 gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]" aria-label="Ringkasan profil">
      <article className="overflow-hidden rounded-2xl border border-border/75 bg-card shadow-soft">
        <div className="border-b border-border/70 px-5 py-3.5">
          <h2 className="text-sm font-bold">Ringkasan Profil</h2>
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground shadow-soft">
              {staffInitials(name)}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold tracking-tight">{name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{roleLabel}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{contextLabel}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 border-t border-border/70 pt-4 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">{identityLabel}</p>
              <p className="mt-1 break-all font-mono text-sm font-semibold">{identityValue || '-'}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Status data</p>
              <p className="mt-1 text-sm font-semibold text-success">Aktif dan tersinkron</p>
            </div>
          </div>
        </div>
      </article>

      <article className="overflow-hidden rounded-2xl border border-border/75 bg-card shadow-soft">
        <div className="border-b border-border/70 px-5 py-3.5">
          <h2 className="text-sm font-bold">{detailTitle}</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{detailDescription}</p>
        </div>
        <dl className="grid gap-x-6 px-5 py-2 sm:grid-cols-2 sm:px-6">
          {facts.map((fact) => (
            <div key={fact.label} className="min-w-0 border-b border-border/60 py-3.5 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0">
              <dt className="text-[11px] font-medium text-muted-foreground">{fact.label}</dt>
              <dd className={`mt-1 break-words text-sm font-semibold ${fact.mono ? 'font-mono' : ''}`}>{fact.value || '-'}</dd>
            </div>
          ))}
        </dl>
      </article>
    </section>
  );
}
