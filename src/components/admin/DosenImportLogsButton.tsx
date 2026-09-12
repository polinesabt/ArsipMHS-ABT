import { useState } from 'react';
import { FileClock } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getApiBaseUrl } from '@/lib/api-client';

interface ImportLog {
  id: string; module: string; file_name: string; total_rows: number; success_rows: number;
  skipped_rows: number; failed_rows: number; affected_dosen: number; status: string; created_at: string;
}
interface ImportDetail { row: number; identity?: string | null; status: string; message: string; }

export function DosenImportLogsButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [error, setError] = useState('');
  const [details, setDetails] = useState<ImportDetail[]>([]);
  const load = async () => {
    setOpen(true); setLoading(true); setError('');
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${getApiBaseUrl()}/dosen/import/logs.php`, { headers: token ? { Authorization: `Bearer ${token}`, 'X-Auth-Token': token } : {} });
      const payload = await response.json() as { success?: boolean; data?: ImportLog[]; error?: string };
      if (!response.ok || !payload.success) throw new Error(payload.error || 'Log gagal dimuat.');
      setLogs(payload.data || []);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Log gagal dimuat.'); }
    finally { setLoading(false); }
  };
  const loadDetails = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${getApiBaseUrl()}/dosen/import/logs.php?id=${encodeURIComponent(id)}`, { headers: token ? { Authorization: `Bearer ${token}`, 'X-Auth-Token': token } : {} });
      const payload = await response.json() as { success?: boolean; data?: { details?: ImportDetail[] }; error?: string };
      if (!response.ok || !payload.success) throw new Error(payload.error || 'Detail log gagal dimuat.');
      setDetails(payload.data?.details || []);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Detail log gagal dimuat.'); }
  };
  return <>
    <Button variant="outline" size="sm" onClick={() => void load()} className="h-9 rounded-xl"><FileClock className="mr-2 h-4 w-4" />Riwayat Impor</Button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-4xl max-h-[90dvh] overflow-y-auto rounded-2xl"><DialogHeader><DialogTitle>Riwayat Impor Excel</DialogTitle></DialogHeader>
      {loading ? <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Memuat riwayat...</div> : error ? <p className="p-4 text-sm text-destructive">{error}</p> : <div className="space-y-4"><div className="max-h-[38vh] overflow-auto rounded-xl border border-border"><table className="min-w-full text-xs"><thead className="bg-muted"><tr><th className="px-3 py-2 text-left">Waktu</th><th className="px-3 py-2 text-left">Modul</th><th className="px-3 py-2 text-left">File</th><th className="px-3 py-2 text-right">Berhasil</th><th className="px-3 py-2 text-right">Dilewati</th><th className="px-3 py-2 text-right">Gagal</th><th className="px-3 py-2 text-left">Status</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id} onClick={() => void loadDetails(log.id)} className="cursor-pointer border-t border-border/60 hover:bg-muted/50"><td className="whitespace-nowrap px-3 py-2">{log.created_at}</td><td className="px-3 py-2">{log.module}</td><td className="max-w-56 truncate px-3 py-2">{log.file_name}</td><td className="px-3 py-2 text-right">{log.success_rows}</td><td className="px-3 py-2 text-right">{log.skipped_rows}</td><td className="px-3 py-2 text-right">{log.failed_rows}</td><td className="px-3 py-2">{log.status}</td></tr>)}</tbody></table>{logs.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Belum ada log impor.</p>}</div>{details.length > 0 && <div className="max-h-40 overflow-auto rounded-xl border border-border"><p className="border-b border-border bg-muted px-3 py-2 text-xs font-semibold">Detail baris (klik log lain untuk mengganti)</p>{details.map((detail) => <p key={`${detail.row}-${detail.status}`} className="border-b border-border/60 px-3 py-2 text-xs"><strong>Baris {detail.row}</strong>{detail.identity ? ` · ${detail.identity}` : ''} — {detail.status}: {detail.message}</p>)}</div>}</div>}
    </DialogContent></Dialog>
  </>;
}
