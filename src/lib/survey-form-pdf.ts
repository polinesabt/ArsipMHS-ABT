/**
 * Generate professional, print-ready PDF for Form Kepuasan Pengguna (legacy or custom).
 * Formal layout, Times font, blank form with underscore lines and empty table cells for manual filling.
 */
import { jsPDF } from 'jspdf';
import type { SurveyDataResponse } from '@/types/evaluation.types';

export interface FormStateForPdf {
  company_name: string;
  company_address: string;
  employee_name: string;
  graduation_year: string;
  study_program: string;
  current_work_division: string;
  major_job_match: 'ya' | 'tidak' | '';
  ratings: Record<string, string>;
}

const BLANK_LINE = '________________________________________________________________';
/** Skala penilaian untuk tabel kompetensi (kuesioner manual). */
const RATING_LABELS = ['Sangat Kurang', 'Kurang', 'Cukup', 'Baik', 'Sangat Baik'];
const FONT = 'times';
const SIZE_BODY = 10;
const SIZE_HEADING = 12;
const SIZE_SECTION = 10;
const MARGIN = 14;
const ROW_HEIGHT = 5.5;
/** Ukuran kotak centang (mm) di tabel penilaian — ala kuesioner cetak. */
const CHECKBOX_SIZE = 4;
/** Tinggi satu baris teks (mm) saat wrap nama aspek. */
const LINE_HEIGHT = 4.5;
const TEXT_COLOR = { r: 0, g: 0, b: 0 };
const MUTED_COLOR = { r: 40, g: 40, b: 40 };

type CustomSection = {
  id: string;
  title?: string;
  type?: string;
  placeholder?: string;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  questions?: Array<{ id: string; title?: string }>;
  questionSource?: string;
};
type CustomAnswerValue = string | string[] | Record<string, string>;

function setBody(doc: jsPDF): void {
  doc.setFont(FONT, 'normal');
  doc.setFontSize(SIZE_BODY);
  doc.setTextColor(TEXT_COLOR.r, TEXT_COLOR.g, TEXT_COLOR.b);
}

function setSectionTitle(doc: jsPDF): void {
  doc.setFont(FONT, 'bold');
  doc.setFontSize(SIZE_SECTION);
  doc.setTextColor(TEXT_COLOR.r, TEXT_COLOR.g, TEXT_COLOR.b);
}

/** Tinggi area kosong untuk tanda tangan (mm). */
const SIGNATURE_AREA_HEIGHT = 14;

function addSignatureBlock(doc: jsPDF, y: number): number {
  doc.setFont(FONT, 'normal');
  doc.setFontSize(SIZE_BODY);
  doc.setTextColor(TEXT_COLOR.r, TEXT_COLOR.g, TEXT_COLOR.b);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);

  // Area kosong untuk tanda tangan (kotak putus-putus agar jelas)
  const sigBoxW = 45;
  doc.setLineDash([2, 2]);
  doc.rect(MARGIN, y, sigBoxW, SIGNATURE_AREA_HEIGHT, 'S');
  doc.setLineDash([]);
  y += SIGNATURE_AREA_HEIGHT + 6;

  doc.text('Tanda Tangan Atasan / Pimpinan Perusahaan', MARGIN, y + 4);
  y += 8;
  doc.text('Nama lengkap:', MARGIN, y + 4);
  doc.text(BLANK_LINE.slice(0, 35), MARGIN + 32, y + 4);
  y += 6;
  doc.text('Tanggal:', MARGIN, y + 4);
  doc.text(BLANK_LINE.slice(0, 25), MARGIN + 22, y + 4);
  return y + 8;
}

function checkNewPage(doc: jsPDF, currentY: number, needed: number): number {
  const pageH = doc.internal.pageSize.getHeight();
  if (currentY + needed > pageH - MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return currentY;
}

function drawFormHeader(
  doc: jsPDF,
  docTitle: string,
  subtitle?: string
): number {
  const pageW = doc.internal.pageSize.getWidth();
  let y = MARGIN;

  doc.setFont(FONT, 'bold');
  doc.setFontSize(SIZE_BODY);
  doc.setTextColor(TEXT_COLOR.r, TEXT_COLOR.g, TEXT_COLOR.b);
  doc.text('POLITEKNIK NEGERI SEMARANG', pageW / 2, y + 4, { align: 'center' });
  y += 6;

  doc.setFontSize(SIZE_HEADING);
  doc.text(docTitle, pageW / 2, y + 4, { align: 'center' });
  y += 6;

  if (subtitle && subtitle.trim()) {
    doc.setFont(FONT, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(MUTED_COLOR.r, MUTED_COLOR.g, MUTED_COLOR.b);
    doc.text(subtitle, pageW / 2, y + 3, { align: 'center' });
    y += 4;
  }

  doc.setFont(FONT, 'normal');
  doc.setFontSize(SIZE_BODY);
  doc.setTextColor(TEXT_COLOR.r, TEXT_COLOR.g, TEXT_COLOR.b);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y + 2, pageW - MARGIN, y + 2);
  y += 8;
  return y;
}

export function downloadLegacyFormPdf(
  surveyData: SurveyDataResponse,
  form: FormStateForPdf
): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  let y = drawFormHeader(
    doc,
    'FORM KEPUASAN PENGGUNA',
    [surveyData.student?.nama?.trim(), surveyData.evaluation?.title].filter(Boolean).join(' — ') || undefined
  );

  setSectionTitle(doc);
  doc.text('Bagian 1 — Identitas Karyawan yang Dinilai', MARGIN, y);
  y += 5;
  setBody(doc);
  const rows1: string[] = [
    'Nama Perusahaan',
    'Alamat Perusahaan',
    'Nama Karyawan yang Dinilai',
    'Tahun Lulus',
    'Program Studi',
    'Bagian / Bidang Kerja Saat Ini',
  ];
  for (const label of rows1) {
    doc.text(label + ': ', MARGIN, y);
    doc.text(BLANK_LINE.slice(0, 50), MARGIN + doc.getTextWidth(label + ': ') + 2, y);
    y += 5;
    if (label === 'Alamat Perusahaan') {
      doc.text(BLANK_LINE.slice(0, 50), MARGIN, y);
      y += 5;
    }
  }
  y += 4;

  setSectionTitle(doc);
  doc.text('Bagian 2 — Kesesuaian Jurusan dengan Pekerjaan', MARGIN, y);
  y += 5;
  setBody(doc);
  doc.text(
    'Apakah jurusan/program studi yang ditempuh sesuai dengan pekerjaan karyawan saat ini?',
    MARGIN,
    y
  );
  y += 5;
  // Satu baris sejajar: [□] Ya  dan  [□] Tidak (simetris, ala kuesioner cetak)
  const boxSize = 3;
  const optionGap = 24;
  const baseY = y + 3.5;
  doc.rect(MARGIN, baseY - boxSize / 2, boxSize, boxSize, 'S');
  doc.text('Ya', MARGIN + boxSize + 3, baseY + 1.2);
  doc.rect(MARGIN + optionGap, baseY - boxSize / 2, boxSize, boxSize, 'S');
  doc.text('Tidak', MARGIN + optionGap + boxSize + 3, baseY + 1.2);
  y += 6;

  setSectionTitle(doc);
  doc.text('Bagian 3 — Tabel Penilaian Kompetensi', MARGIN, y);
  y += 5;
  setBody(doc);
  doc.setFontSize(10);
  const aspects = surveyData.aspects ?? [];
  const colNo = 10;
  const colRatingW = 22;
  const colAspect = pageW - 2 * MARGIN - colNo - 5 * colRatingW;
  const headY = y;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.setFont(FONT, 'bold');
  doc.setFontSize(7);
  doc.text('No', MARGIN + colNo / 2 - doc.getTextWidth('No') / 2, headY + 4);
  doc.text('Aspek Penilaian', MARGIN + colNo + 2, headY + 4);
  RATING_LABELS.forEach((l, i) => {
    const cx = MARGIN + colNo + colAspect + i * colRatingW + colRatingW / 2;
    doc.text(l, cx, headY + 4, { align: 'center' });
  });
  doc.setFont(FONT, 'normal');
  doc.setFontSize(9);
  const maxAspectWidth = colAspect - 4;
  y = headY + ROW_HEIGHT;
  aspects.forEach((a, i) => {
    const name = (a.name ?? '').trim() || '-';
    const lines = doc.splitTextToSize(name, maxAspectWidth);
    const rowH = Math.max(ROW_HEIGHT, lines.length * LINE_HEIGHT);
    y = checkNewPage(doc, y, rowH);
    const boxYOffset = (rowH - CHECKBOX_SIZE) / 2;
    for (let c = 0; c < 5; c++) {
      const cellLeft = MARGIN + colNo + colAspect + c * colRatingW;
      const boxX = cellLeft + (colRatingW - CHECKBOX_SIZE) / 2;
      const boxY = y + boxYOffset;
      doc.rect(boxX, boxY, CHECKBOX_SIZE, CHECKBOX_SIZE, 'S');
    }
    doc.text(String(i + 1), MARGIN + colNo / 2 - doc.getTextWidth(String(i + 1)) / 2, y + rowH / 2 + 1.2);
    lines.forEach((line, li) => {
      doc.text(line, MARGIN + colNo + 2, y + 4 + li * LINE_HEIGHT);
    });
    y += rowH;
  });
  y += 6;

  y = checkNewPage(doc, y, 50);
  y = addSignatureBlock(doc, y);

  doc.save(`Form-Kepuasan-${(surveyData.student?.nama ?? 'Survey').replace(/[^\w\s-]/g, '').slice(0, 30)}.pdf`);
}

export function downloadCustomFormPdf(
  surveyData: SurveyDataResponse,
  customSections: CustomSection[],
  customAnswers: Record<string, CustomAnswerValue>,
  activeAspects: Array<{ id: string; name: string }>
): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const title = surveyData.active_template?.title ?? 'Form Kepuasan Pengguna';
  const subtitle = [surveyData.student?.nama?.trim(), surveyData.evaluation?.title].filter(Boolean).join(' — ') || undefined;
  let y = drawFormHeader(doc, title, subtitle);

  for (const section of customSections) {
    y = checkNewPage(doc, y, 25);
    const secTitle = section.title ?? 'Pertanyaan';
    setSectionTitle(doc);
    doc.text(secTitle + (section.required ? ' *' : ''), MARGIN, y);
    y += 5;
    setBody(doc);

    const type = section.type ?? 'open';

    if (type === 'open') {
      doc.text(BLANK_LINE.slice(0, 55), MARGIN, y);
      y += 5;
    } else if (type === 'multiple_choice') {
      const opts = section.options ?? [];
      const boxSize = 3;
      const a = opts[0]?.trim().toLowerCase();
      const b = opts[1]?.trim().toLowerCase();
      const isYaTidak = opts.length === 2 && ((a === 'ya' && b === 'tidak') || (a === 'tidak' && b === 'ya'));
      if (isYaTidak) {
        const optionGap = 24;
        const baseY = y + 3.5;
        const yaText = a === 'ya' ? opts[0].trim() : opts[1].trim();
        const tidakText = a === 'tidak' ? opts[0].trim() : opts[1].trim();
        doc.rect(MARGIN, baseY - boxSize / 2, boxSize, boxSize, 'S');
        doc.text(yaText, MARGIN + boxSize + 3, baseY + 1.2);
        doc.rect(MARGIN + optionGap, baseY - boxSize / 2, boxSize, boxSize, 'S');
        doc.text(tidakText, MARGIN + optionGap + boxSize + 3, baseY + 1.2);
        y += 6;
      } else {
        opts.forEach((o) => {
          doc.rect(MARGIN, y - 1.5, boxSize, boxSize, 'S');
          doc.text(o, MARGIN + boxSize + 3, y + 4);
          y += 5;
        });
        y += 1;
      }
    } else if (type === 'scale') {
      const questions =
        section.questionSource === 'evaluation_aspects'
          ? activeAspects.map((a) => ({ id: a.id, title: a.name }))
          : section.questions ?? [];
      const scaleMin = section.scaleMin ?? 1;
      const scaleMax = section.scaleMax ?? 5;
      const numCols = scaleMax - scaleMin + 1;
      const useTextLabels = numCols === 5;
      const colAspect = 55;
      const colScore = (pageW - 2 * MARGIN - colAspect) / numCols;
      const headY = y;
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      doc.setFont(FONT, 'bold');
      doc.setFontSize(7);
      doc.text('Aspek', MARGIN + colAspect / 2 - doc.getTextWidth('Aspek') / 2, headY + 4);
      if (useTextLabels) {
        RATING_LABELS.forEach((label, i) => {
          const cx = MARGIN + colAspect + i * colScore + colScore / 2;
          doc.text(label, cx, headY + 4, { align: 'center' });
        });
      } else {
        for (let s = scaleMin; s <= scaleMax; s++) {
          const cx = MARGIN + colAspect + (s - scaleMin) * colScore + colScore / 2;
          doc.text(String(s), cx, headY + 4, { align: 'center' });
        }
      }
      doc.setFont(FONT, 'normal');
      doc.setFontSize(SIZE_BODY);
      const maxLabelW = colAspect - 4;
      y = headY + ROW_HEIGHT;
      questions.forEach((q) => {
        const labelText = (q.title ?? q.id).trim() || '-';
        const lines = doc.splitTextToSize(labelText, maxLabelW);
        const rowH = Math.max(ROW_HEIGHT, lines.length * LINE_HEIGHT);
        y = checkNewPage(doc, y, rowH);
        const boxYOffset = (rowH - CHECKBOX_SIZE) / 2;
        for (let s = scaleMin; s <= scaleMax; s++) {
          const cellLeft = MARGIN + colAspect + (s - scaleMin) * colScore;
          const boxX = cellLeft + (colScore - CHECKBOX_SIZE) / 2;
          const boxY = y + boxYOffset;
          doc.rect(boxX, boxY, CHECKBOX_SIZE, CHECKBOX_SIZE, 'S');
        }
        lines.forEach((line, li) => {
          doc.text(line, MARGIN + 2, y + 4 + li * LINE_HEIGHT);
        });
        y += rowH;
      });
      y += 4;
    } else if (type === 'file_upload') {
      doc.text(BLANK_LINE.slice(0, 55), MARGIN, y);
      y += 5;
    }
    y += 3;
  }

  y = checkNewPage(doc, y, 50);
  y = addSignatureBlock(doc, y);

  doc.save(`Form-Kepuasan-${(surveyData.student?.nama ?? 'Survey').replace(/[^\w\s-]/g, '').slice(0, 30)}.pdf`);
}
