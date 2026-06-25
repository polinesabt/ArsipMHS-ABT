/**
 * Excel import utilities for bulk student account creation.
 *
 * NOTE:
 * - Parsing is done entirely on the frontend using exceljs.
 * - Password dari Excel akan dikirim ke backend apa adanya,
 *   backend yang akan melakukan hashing sebelum disimpan.
 */

import type { StudentAccountInput, StudentStatus, StudentStatusMode } from '@/types/student.types';

export type ParsedStudentAccount = StudentAccountInput;

export interface ImportResult {
  accounts: ParsedStudentAccount[];
  warnings: string[];
}

const STATUS_MAP: Record<string, StudentStatus> = {
  active: 'active',
  'mahasiswa aktif': 'active',
  aktif: 'active',
  alumni: 'alumni',
  on_leave: 'on_leave',
  'on leave': 'on_leave',
  'on-leave': 'on_leave',
  cuti: 'on_leave',
  dropout: 'dropout',
  keluar: 'dropout',
};

const STATUS_MODE_MAP: Record<string, StudentStatusMode> = {
  auto: 'auto',
  otomatis: 'auto',
  'status otomatis': 'auto',
  yes: 'auto',
  ya: 'auto',
  true: 'auto',
  '1': 'auto',
  on: 'auto',
  manual: 'manual',
  override: 'manual',
  no: 'manual',
  tidak: 'manual',
  false: 'manual',
  '0': 'manual',
  off: 'manual',
};

/**
 * Normalize header value to match standard template column names.
 * Supports various naming variations for backward compatibility.
 */
function normalizeHeader(value: unknown): string {
  if (value == null) return '';
  let key = String(value).trim().toLowerCase();
  
  // Normalisasi variasi penulisan ke standar
  // "No HP", "No. HP", "Nomor HP" -> "nomor hp"
  if (key === 'no hp' || key === 'no. hp' || key === 'nomor hp' || key === 'nomor') {
    key = 'nomor hp';
  }
  
  // "Tahun_Masuk" -> "tahun masuk"
  if (key === 'tahun_masuk') key = 'tahun masuk';
  
  // "Tahun_Lulus" -> "tahun lulus"
  if (key === 'tahun_lulus') key = 'tahun lulus';

  // "Status_Mode", "Status Mode", "Mode Status" -> "status otomatis"
  if (
    key === 'status_mode' ||
    key === 'status mode' ||
    key === 'mode status' ||
    key === 'status otomatis'
  ) {
    key = 'status otomatis';
  }
  
  return key;
}

function mapStatus(raw: unknown): StudentStatus {
  const key = normalizeHeader(raw);
  if (!key) return 'active';
  return STATUS_MAP[key] ?? 'active';
}

function mapStatusMode(raw: unknown): StudentStatusMode | undefined {
  if (raw == null) return undefined;
  const key = String(raw).trim().toLowerCase();
  if (!key) return undefined;
  return STATUS_MODE_MAP[key];
}

/**
 * Parse uploaded Excel file into student account payloads.
 *
 * Expected format (mengikuti standar template):
 * - Baris 1: Header (wajib)
 * - Baris 2+: Data mahasiswa
 *
 * Minimal required columns (case-insensitive):
 * - Nama
 * - NIM
 *
 * Optional columns:
 * - Email
 * - Nomor HP / Nomor / No HP / No. HP
 * - Tahun Masuk / Tahun_Masuk
 * - Tahun Lulus / Tahun_Lulus
 * - Password (boleh kosong -> akan diisi default NIM di frontend)
 * - Status Otomatis / Status_Mode / Status Mode (opsional, default auto)
 * - Status
 */
export async function parseStudentAccountsFromExcel(file: File): Promise<ImportResult> {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  const buffer = await file.arrayBuffer();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('File Excel tidak memiliki worksheet');
  }

  // Cari baris header secara dinamis (mendukung catatan di atas tabel)
  const headerMap: Record<string, number> = {};
  const requiredColumns = ['nama', 'nim'];
  let headerRowIndex = 1;
  let foundHeader = false;

  const maxScanRow = Math.min(10, worksheet.rowCount || 10);
  for (let rowIndex = 1; rowIndex <= maxScanRow; rowIndex++) {
    const row = worksheet.getRow(rowIndex);
    const candidateMap: Record<string, number> = {};

    row.eachCell((cell, colNumber) => {
      const key = normalizeHeader(cell.value);
      if (key) {
        candidateMap[key] = colNumber;
      }
    });

    const hasAllRequired = requiredColumns.every(col => !!candidateMap[col]);
    if (hasAllRequired) {
      Object.assign(headerMap, candidateMap);
      headerRowIndex = rowIndex;
      foundHeader = true;
      break;
    }
  }

  if (!foundHeader) {
    const missing = requiredColumns.filter(col => !headerMap[col]);
    throw new Error(
      `Header wajib tidak ditemukan: ${missing.map(c => `"${c}"`).join(', ')}. ` +
      `Kolom wajib: ${requiredColumns.map(c => `"${c}"`).join(', ')}. ` +
      `Pastikan file Excel mengikuti format standar template.`
    );
  }

  const accounts: ParsedStudentAccount[] = [];
  const warnings: string[] = [];

  const lastRow = worksheet.rowCount;
  const currentYear = new Date().getFullYear();

  for (let rowIndex = headerRowIndex + 1; rowIndex <= lastRow; rowIndex++) {
    const row = worksheet.getRow(rowIndex);

    const nimCell = headerMap['nim'] ? row.getCell(headerMap['nim']) : null;
    const namaCell = headerMap['nama'] ? row.getCell(headerMap['nama']) : null;

    const nimRaw = nimCell?.value;
    const namaRaw = namaCell?.value;

    const nim = nimRaw ? String(nimRaw).trim() : '';
    const nama = namaRaw ? String(namaRaw).trim() : '';

    if (!nim && !nama) {
      continue; // skip empty row
    }

    if (!nim || !nama) {
      warnings.push(`Baris ${rowIndex}: NIM dan Nama wajib diisi, baris di-skip.`);
      continue;
    }

    // Optional fields (menggunakan headerMap yang sudah dinormalisasi)
    const passwordCell = headerMap['password'] ? row.getCell(headerMap['password']) : null;
    const emailCell = headerMap['email'] ? row.getCell(headerMap['email']) : null;
    const nomorCell = headerMap['nomor hp'] ? row.getCell(headerMap['nomor hp']) : null;
    const statusModeCell = headerMap['status otomatis'] ? row.getCell(headerMap['status otomatis']) : null;
    const statusCell = headerMap['status'] ? row.getCell(headerMap['status']) : null;
    const tahunMasukCell = headerMap['tahun masuk'] ? row.getCell(headerMap['tahun masuk']) : null;
    const tahunLulusCell = headerMap['tahun lulus'] ? row.getCell(headerMap['tahun lulus']) : null;

    let password = passwordCell?.value ? String(passwordCell.value).trim() : '';
    if (!password) {
      // Default ke NIM tanpa titik jika password kosong
      const numericNim = nim.replace(/\./g, '');
      password = numericNim || nim;
    }

    const email = emailCell?.value ? String(emailCell.value).trim() : undefined;
    const noHp = nomorCell?.value ? String(nomorCell.value).trim() : undefined;

    let tahunMasuk = currentYear;
    if (tahunMasukCell?.value != null && tahunMasukCell.value !== '') {
      const v = Number(tahunMasukCell.value);
      if (!Number.isNaN(v) && v > 1900 && v < 3000) {
        tahunMasuk = v;
      } else {
        warnings.push(`Baris ${rowIndex}: Tahun Masuk tidak valid, digunakan tahun sekarang (${currentYear}).`);
      }
    }

    let tahunLulus: number | undefined;
    if (tahunLulusCell?.value != null && tahunLulusCell.value !== '') {
      const v = Number(tahunLulusCell.value);
      if (!Number.isNaN(v) && v > 1900 && v < 3000) {
        tahunLulus = v;
      } else {
        warnings.push(`Baris ${rowIndex}: Tahun Lulus tidak valid, diabaikan.`);
      }
    }

    const status = mapStatus(statusCell?.value);
    let statusMode = mapStatusMode(statusModeCell?.value) ?? 'auto';
    if (status === 'on_leave' || status === 'dropout') {
      // Safety: cuti/dropout harus manual override agar tidak diabaikan oleh mode auto.
      statusMode = 'manual';
    }

    accounts.push({
      nim,
      nama,
      password,
      email,
      noHp,
      status,
      statusMode,
      tahunMasuk,
      tahunLulus,
    });
  }

  return { accounts, warnings };
}
