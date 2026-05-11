import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  getSatisfactionTemplates,
  deleteSatisfactionTemplate,
  setActiveSatisfactionTemplate,
} from '@/repositories/satisfaction-form.repository';
import type { SatisfactionFormTemplate, SatisfactionSection } from '@/types/satisfaction-form.types';
import { FileText, Loader2, Pencil, Plus, CheckSquare, Trash2, Check, FileDown, Eye } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

function buildTemplatePrintHtml(template: SatisfactionFormTemplate): string {
  const sections = template.definition?.sections ?? [];
  const sectionHtml = sections
    .map((sec: SatisfactionSection, i: number) => {
      const title = sec.title || `Pertanyaan ${i + 1}`;
      const required = sec.required ? ' <span style="color:#dc2626">*</span>' : '';
      let body = '';
      if (sec.type === 'open') {
        body = `<p style="color:#737373;font-size:14px">${(sec as { placeholder?: string }).placeholder || 'Jawaban terbuka'}</p>`;
      } else if (sec.type === 'multiple_choice') {
        const opts = (sec as { options?: string[] }).options ?? [];
        body = opts.map((o) => `<div>☐ ${o}</div>`).join('');
      } else if (sec.type === 'scale') {
        const s = sec as { scaleMin?: number; scaleMax?: number; questions?: Array<{ title: string }> };
        const min = s.scaleMin ?? 1;
        const max = s.scaleMax ?? 5;
        const scaleLabel = `${min} – ${max}`;
        const questions = s.questions ?? [];
        body = questions.map((q) => `<div>${q.title} (${scaleLabel})</div>`).join('');
      } else if (sec.type === 'file_upload') {
        body = '<p style="color:#737373">[Unggah lampiran]</p>';
      }
      return `<div style="margin-bottom:20px"><strong>${title}${required}</strong><div style="margin-top:8px">${body}</div></div>`;
    })
    .join('');
  return `
  <div class="pdf-content" style="font-family:system-ui,sans-serif;width:210mm;padding:20px;background:#fff;color:#111;">
    <h1 style="font-size:1.5rem;margin-bottom:24px">${template.title}</h1>
    ${sectionHtml}
  </div>`;
}

function sanitizeFilename(title: string): string {
  return title.replace(/[<>:"/\\|?*]/g, '_').slice(0, 100) || 'form-kepuasan';
}

async function exportTemplateToPdf(template: SatisfactionFormTemplate): Promise<void> {
  const html = buildTemplatePrintHtml(template);
  const wrap = document.createElement('div');
  wrap.style.position = 'fixed';
  wrap.style.left = '-9999px';
  wrap.style.top = '0';
  wrap.style.width = '210mm';
  wrap.style.background = '#fff';
  wrap.innerHTML = html;
  document.body.appendChild(wrap);

  try {
    const el = wrap.querySelector('.pdf-content') as HTMLElement;
    if (!el) throw new Error('Element not found');
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });
    document.body.removeChild(wrap);

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;
    pdf.addImage(imgData, 'JPEG', 0, 0, imgW, Math.min(imgH, pageH));
    if (imgH > pageH) {
      let heightLeft = imgH - pageH;
      let position = -pageH;
      while (heightLeft > 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH);
        heightLeft -= pageH;
        position -= pageH;
      }
    }
    const filename = `${sanitizeFilename(template.title)}.pdf`;
    pdf.save(filename);
  } catch (e) {
    document.body.removeChild(wrap);
    throw e;
  }
}
import { cn } from '@/lib/utils';

const PAGE_SIZE = 24;

export default function AdminKustomFormKepuasanPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<SatisfactionFormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectMode, setSelectMode] = useState(false);
  const [pickTemplateMode, setPickTemplateMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [animatingSelectionId, setAnimatingSelectionId] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSatisfactionTemplates();
      if (res.success && res.data) {
        setTemplates(res.data);
        const active = res.data.find((t) => t.is_active);
        setActiveId(active?.id ?? null);
      } else {
        toast({ title: 'Gagal memuat template', description: res.error, variant: 'destructive' });
      }
    } catch (e) {
      toast({
        title: 'Gagal memuat template',
        description: e instanceof Error ? e.message : 'Kesalahan tidak dikenal',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  const toggleSelect = (id: string, isDefault: boolean) => {
    if (isDefault) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    const nonDefault = templates.filter((t) => !t.is_default).map((t) => t.id);
    setSelectedIds(checked ? new Set(nonDefault) : new Set());
  };

  const handleDeleteBatch = async () => {
    const ids = Array.from(selectedIds);
    const withDefault = templates.find((t) => ids.includes(t.id) && t.is_default);
    if (withDefault) {
      toast({ title: 'Template utama tidak dapat dihapus', variant: 'destructive' });
      return;
    }
    setDeletingIds((p) => new Set([...p, ...ids]));
    for (const id of ids) {
      const res = await deleteSatisfactionTemplate(id);
      if (!res.success) {
        toast({ title: 'Gagal menghapus template', description: res.error, variant: 'destructive' });
      }
    }
    setDeletingIds((p) => {
      const next = new Set(p);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    setSelectedIds(new Set());
    toast({ title: 'Template dipindahkan ke Recycle Bin' });
    void loadTemplates();
  };

  const handlePickTemplate = async (id: string) => {
    setSelectingId(id);
    try {
      const res = await setActiveSatisfactionTemplate(id);
      if (res.success) {
        setAnimatingSelectionId(id);
        setActiveId(id);
        toast({ title: 'Template aktif diperbarui' });
        setTimeout(() => {
          setAnimatingSelectionId(null);
          setPickTemplateMode(false);
        }, 850);
      } else {
        toast({ title: 'Gagal mengaktifkan template', description: res.error, variant: 'destructive' });
      }
    } finally {
      setSelectingId(null);
    }
  };

  const isAllSelected =
    templates.filter((t) => !t.is_default).length > 0 &&
    templates.every((t) => t.is_default || selectedIds.has(t.id));

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Kustom Formulir Kepuasan Pengguna</h2>
          <CardDescription>
            Buat dan kelola template form kepuasan. Template aktif dipakai untuk survey evaluasi.
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate('/admin/kustom-form-kepuasan/new')} className="gap-2">
            <Plus className="h-4 w-4" />
            Buat Formulir
          </Button>
          <Button
            variant={selectMode ? 'secondary' : 'outline'}
            onClick={() => {
              setSelectMode(!selectMode);
              if (selectMode) setSelectedIds(new Set());
            }}
            className="gap-2"
          >
            <CheckSquare className="h-4 w-4" />
            Checklist
          </Button>
          <Button
            variant={pickTemplateMode ? 'default' : 'outline'}
            onClick={() => setPickTemplateMode(!pickTemplateMode)}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Pilih Template
          </Button>
        </div>
      </div>

      {selectMode && (
        <Card>
          <CardContent className="flex flex-wrap items-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const toExport = templates.filter((t) => selectedIds.has(t.id));
                if (toExport.length === 0) {
                  toast({ title: 'Pilih minimal satu template untuk export PDF', variant: 'destructive' });
                  return;
                }
                try {
                  for (let i = 0; i < toExport.length; i++) {
                    await exportTemplateToPdf(toExport[i]);
                    if (i < toExport.length - 1) await new Promise((r) => setTimeout(r, 300));
                  }
                  toast({
                    title: toExport.length === 1 ? 'PDF berhasil diunduh' : `${toExport.length} PDF berhasil diunduh`,
                  });
                } catch (e) {
                  toast({
                    title: 'Gagal export PDF',
                    description: e instanceof Error ? e.message : 'Kesalahan tidak dikenal',
                    variant: 'destructive',
                  });
                }
              }}
              disabled={selectedIds.size === 0}
              className="gap-2"
            >
              <FileDown className="h-4 w-4" />
              Export PDF ({selectedIds.size})
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteBatch}
              disabled={selectedIds.size === 0 || deletingIds.size > 0}
              className="gap-2"
            >
              {deletingIds.size > 0 ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Hapus ({selectedIds.size})
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
              Batal pilih
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => {
            const isDefault = template.is_default;
            const isActive = template.id === activeId;
            const isSelected = selectedIds.has(template.id);
            const isSelecting = selectingId === template.id;

            return (
              <Card
                key={template.id}
                className={cn(
                  'group relative overflow-hidden transition-all duration-300',
                  pickTemplateMode && 'scale-105',
                  isActive && !pickTemplateMode && 'ring-2 ring-primary',
                  animatingSelectionId === template.id && 'liquid-select',
                  !isActive && !pickTemplateMode && templates.some((t) => t.id === activeId) && 'opacity-75'
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    {selectMode && !isDefault && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => toggleSelect(template.id, isDefault)}
                        className="mt-1 h-6 w-6 min-w-6 min-h-6 rounded border-input cursor-pointer shrink-0"
                        aria-label={`Pilih ${template.title}`}
                      />
                    )}
                    <CardTitle className="text-base leading-tight break-words flex-1">
                      {template.title}
                    </CardTitle>
                  </div>
                  {isDefault && (
                    <span className="text-xs text-muted-foreground">Template utama (hanya dipakai)</span>
                  )}
                  {isActive && !isDefault && (
                    <span className="text-xs text-primary font-medium">Template aktif</span>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  {pickTemplateMode && (
                    <Button
                      size="sm"
                      className="gap-1"
                      onClick={() => handlePickTemplate(template.id)}
                      disabled={isSelecting}
                    >
                      {isSelecting ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                      Pilih template
                    </Button>
                  )}
                  {!pickTemplateMode && !selectMode && isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() =>
                        navigate(`/admin/kustom-form-kepuasan/preview/${template.id}`, {
                          state: {
                            returnTo: '/admin/kustom-form-kepuasan',
                            returnLabel: 'Kembali ke daftar template',
                          },
                        })
                      }
                    >
                      <Eye className="h-3 w-3" />
                      View Template Utama
                    </Button>
                  )}
                </CardContent>
                {!isDefault && !pickTemplateMode && !selectMode && (
                  <div
                    className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg border border-transparent bg-background/80 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:border-muted"
                    aria-hidden
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gap-1 shadow"
                      onClick={() => navigate(`/admin/kustom-form-kepuasan/edit/${template.id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {!loading && templates.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Belum ada template. Klik &quot;Buat Formulir&quot; untuk membuat template pertama.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
