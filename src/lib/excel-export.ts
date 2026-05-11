/**
 * Excel export utilities for student/alumni data and chart records.
 *
 * NOTE:
 * - This is purely a frontend concern; no backend or endpoint changes.
 * - Uses exceljs and runs fully in the browser.
 */

export interface ChartRecordExcelRow {
  nim: string;
  nama: string;
  tahun_pelaporan: number;
  payload_preview: string;
  /** Untuk section Prestasi Mahasiswa */
  jenis_prestasi?: string;
  kategori_prestasi?: string;
  nama_prestasi?: string;
}

export interface StudentExcelRow {
  nama: string;
  nim: string;
  email: string;
  nomor: string;
  tahunMasuk: number | string;
  tahunLulus: number | string | null;
  password?: string;
}

interface ExportOptions {
  filename?: string;
  title?: string;
}

/**
 * STANDAR TEMPLATE EXCEL DATA MAHASISWA
 * 
 * Template ini digunakan untuk:
 * 1. Export data mahasiswa dari dashboard
 * 2. Download template kosong untuk import
 * 3. Import data mahasiswa (parser membaca format ini)
 * 
 * STRUKTUR:
 * - Baris 1: Header (wajib)
 * - Baris 2+: Data mahasiswa
 * 
 * KOLOM WAJIB: Nama, NIM
 * KOLOM OPSIONAL: Email, Nomor HP, Tahun Masuk, Tahun Lulus, Password, Status Otomatis, Status
 */
export const STUDENT_EXCEL_TEMPLATE = {
  // Urutan kolom standar (sesuai urutan di Excel)
  headers: [
    'Nama',
    'NIM',
    'Email',
    'Nomor HP',
    'Tahun Masuk',
    'Tahun Lulus',
    'Password',
    'Status Otomatis',
    'Status',
  ] as const,

  // Kolom wajib (minimal harus ada)
  requiredColumns: ['nama', 'nim'] as const,
} as const;

/**
 * Export given rows to an Excel (.xlsx) file with:
 * - Header row on the first row (mengikuti standar template)
 * - Styled header row (bold, grey background, centered)
 * - Borders on all cells
 * - Auto column width
 * 
 * File yang dihasilkan dapat langsung di-import kembali ke sistem.
 */
export async function exportStudentsToExcel(
  rows: StudentExcelRow[],
  options: ExportOptions = {}
): Promise<void> {
  if (!rows || rows.length === 0) {
    // Nothing to export
    return;
  }

  const ExcelJS = await import('exceljs');

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data Mahasiswa');

  // Header di baris 1 (mengikuti standar template)
  const headerRowIndex = 1;
  const dataStartRowIndex = headerRowIndex + 1;
  
  const headers = STUDENT_EXCEL_TEMPLATE.headers;
  worksheet.addRow(headers);

  // Tambahkan data mengikuti urutan header standar
  rows.forEach((row) => {
    worksheet.addRow([
      row.nama,                    // index 0: Nama
      row.nim,                     // index 1: NIM
      row.email || '',             // index 2: Email
      row.nomor || '',             // index 3: Nomor HP
      row.tahunMasuk,              // index 4: Tahun Masuk
      row.tahunLulus ?? '',        // index 5: Tahun Lulus
      row.password ?? '',          // index 6: Password
      'auto',                      // index 7: Status Otomatis (default auto)
      '',                          // index 8: Status (manual, opsional; kosongkan agar auto menghitung efektif)
    ]);
  });

  // Styling header (bold, abu, centered)
  const headerRow = worksheet.getRow(headerRowIndex);
  headerRow.eachCell((cell) => {
    cell.font = { ...(cell.font ?? {}), bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9D9D9' }, // light grey
    };
  });

  // Border semua sel (header + data)
  const lastRowIndex = worksheet.rowCount;
  for (let rowIndex = headerRowIndex; rowIndex <= lastRowIndex; rowIndex++) {
    const row = worksheet.getRow(rowIndex);
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  }

  // Auto column width
  const columnCount = headers.length;
  for (let colIndex = 1; colIndex <= columnCount; colIndex++) {
    let maxLength = 0;
    
    // Include header in width calculation
    const headerText = String(headers[colIndex - 1] ?? '');
    maxLength = Math.max(maxLength, headerText.length);
    
    for (let rowIndex = dataStartRowIndex; rowIndex <= lastRowIndex; rowIndex++) {
      const cell = worksheet.getRow(rowIndex).getCell(colIndex);
      const cellValue = cell.value;
      if (cellValue == null) continue;
      const text = typeof cellValue === 'string' ? cellValue : String(cellValue);
      maxLength = Math.max(maxLength, text.length);
    }
    
    const column = worksheet.getColumn(colIndex);
    column.width = Math.min(Math.max(maxLength + 2, 10), 40); // min 10, max 40
  }

  // Generate file and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = options.filename ?? 'data-mahasiswa.xlsx';
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export chart records (Advanced Settings) to XLSX.
 * Untuk section Prestasi Mahasiswa, gunakan kolom opsional jenis_prestasi, kategori_prestasi, nama_prestasi.
 */
export async function exportChartRecordsToExcel(
  rows: ChartRecordExcelRow[],
  sectionLabel: string,
  filename?: string
): Promise<void> {
  if (!rows || rows.length === 0) return;
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data Chart');
  const hasPrestasiColumns = rows.some(
    (r) =>
      r.jenis_prestasi !== undefined ||
      r.kategori_prestasi !== undefined ||
      r.nama_prestasi !== undefined
  );
  const headers = hasPrestasiColumns
    ? ['NIM', 'Nama', 'Jenis Prestasi', 'Kategori', 'Nama Prestasi', 'Tahun Pelaporan', 'Payload']
    : ['NIM', 'Nama', 'Tahun Pelaporan', 'Payload'];
  worksheet.addRow(headers);
  rows.forEach((r) => {
    if (hasPrestasiColumns) {
      worksheet.addRow([
        r.nim,
        r.nama,
        r.jenis_prestasi ?? '',
        r.kategori_prestasi ?? '',
        r.nama_prestasi ?? '',
        r.tahun_pelaporan,
        r.payload_preview,
      ]);
    } else {
      worksheet.addRow([r.nim, r.nama, r.tahun_pelaporan, r.payload_preview]);
    }
  });
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  });
  const safeName = sectionLabel.replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 50);
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename ?? `export-${safeName}-${new Date().toISOString().slice(0, 10)}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Generate an official Excel template for importing student accounts.
 *
 * Template ini menggunakan standar yang sama dengan export data mahasiswa,
 * sehingga file export dapat langsung di-import kembali tanpa modifikasi.
 *
 * - Header row is on the first row (mengikuti standar)
 * - Minimal required columns: Nama, NIM
 * - Optional columns: Email, Nomor HP, Tahun Masuk, Tahun Lulus, Password, Status Otomatis, Status
 */
export async function exportStudentImportTemplate(): Promise<void> {
  const ExcelJS = await import('exceljs');

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Template Import Akun');
  const headers = STUDENT_EXCEL_TEMPLATE.headers;
  const currentYear = new Date().getFullYear();
  const selectableYears = Array.from({ length: 15 }, (_, i) => String(currentYear - i));
  const statusModeValues = ['auto', 'manual'] as const;
  const statusValues = ['active', 'alumni', 'on_leave', 'dropout'] as const;

  // Catatan di atas tabel (tidak dipakai parser, hanya panduan)
  const noteRow = worksheet.addRow([
    'CATATAN: Isi data mulai baris di bawah header. ' +
    'Kolom wajib: Nama dan NIM. Kolom lain opsional. ' +
    'Status Otomatis gunakan nilai canonical (auto/manual). ' +
    'Status (manual) gunakan nilai canonical (active/alumni/on_leave/dropout).',
  ]);
  worksheet.mergeCells(1, 1, 1, headers.length);
  const noteCell = noteRow.getCell(1);
  noteCell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
  noteCell.font = { ...(noteCell.font ?? {}), italic: true, color: { argb: 'FF555555' } };

  // Header ditempatkan setelah baris catatan
  const headerRow = worksheet.addRow(headers);

  // Styling header
  headerRow.eachCell((cell) => {
    cell.font = { ...(cell.font ?? {}), bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9D9D9' }, // light grey
    };
  });

  // Baris contoh (opsional, bisa dihapus admin)
  worksheet.addRow([
    'Contoh Nama Mahasiswa',     // Nama
    '202312345',                 // NIM
    'email@contoh.ac.id',        // Email
    '081234567890',              // Nomor HP
    currentYear,                 // Tahun Masuk
    '',                          // Tahun Lulus
    '202312345',                 // Password (opsional, default = NIM jika kosong)
    'auto',                      // Status Otomatis (opsional, default auto)
    'active',                    // Status (opsional, default active)
  ]);

  // Border header + contoh
  for (let rowIndex = 1; rowIndex <= worksheet.rowCount; rowIndex++) {
    const row = worksheet.getRow(rowIndex);
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  }

  const headerRowIndex = headerRow.number;
  const firstDataRow = headerRowIndex + 1;
  const lastDataRow = headerRowIndex + 999;
  const applyListValidation = (
    columnIndex: number,
    values: readonly string[],
    allowBlank: boolean,
    errorTitle: string,
    errorMessage: string
  ) => {
    if (columnIndex <= 0) return;
    const formula = `"${values.join(',')}"`;
    for (let rowIndex = firstDataRow; rowIndex <= lastDataRow; rowIndex++) {
      const cell = worksheet.getRow(rowIndex).getCell(columnIndex);
      cell.dataValidation = {
        type: 'list',
        allowBlank,
        formulae: [formula],
        showErrorMessage: true,
        errorTitle,
        error: errorMessage,
      };
    }
  };

  applyListValidation(
    headers.indexOf('Status') + 1,
    statusValues,
    true,
    'Status tidak valid',
    'Pilih salah satu nilai: active, alumni, on_leave, dropout.'
  );
  applyListValidation(
    headers.indexOf('Status Otomatis') + 1,
    statusModeValues,
    true,
    'Status Otomatis tidak valid',
    'Pilih salah satu nilai: auto, manual.'
  );
  applyListValidation(
    headers.indexOf('Tahun Masuk') + 1,
    selectableYears,
    true,
    'Tahun Masuk tidak valid',
    `Pilih salah satu tahun: ${selectableYears.join(', ')}`
  );
  applyListValidation(
    headers.indexOf('Tahun Lulus') + 1,
    selectableYears,
    true,
    'Tahun Lulus tidak valid',
    `Pilih salah satu tahun: ${selectableYears.join(', ')}`
  );

  // Auto-fit column width
  const columnCount = headers.length;
  for (let colIndex = 1; colIndex <= columnCount; colIndex++) {
    let maxLength = 0;
    
    for (let rowIndex = 1; rowIndex <= worksheet.rowCount; rowIndex++) {
      const cell = worksheet.getRow(rowIndex).getCell(colIndex);
      const cellValue = cell.value;
      if (cellValue == null) continue;
      const text = typeof cellValue === 'string' ? cellValue : String(cellValue);
      maxLength = Math.max(maxLength, text.length);
    }
    
    const column = worksheet.getColumn(colIndex);
    column.width = Math.min(Math.max(maxLength + 2, 10), 40);
  }

  // Generate file and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'template-import-akun-mahasiswa.xlsx';
  link.click();
  URL.revokeObjectURL(url);
}

/** Baris hasil evaluasi untuk export Excel (format sama dengan EvaluationResultRow) */
export interface EvaluationResultExcelRow {
  evaluation_title: string;
  nama: string;
  nim: string;
  company_name: string;
  employee_name: string;
  major_job_match: string;
  submitted_at: string;
}

/**
 * Export hasil survey evaluasi ke Excel (.xlsx).
 * Digunakan untuk ekspor data terpilih dari tab Evaluasi Selesai.
 */
export async function exportEvaluationResultsToExcel(
  rows: EvaluationResultExcelRow[],
  filename = 'hasil-evaluasi-lulusan.xlsx'
): Promise<void> {
  if (!rows || rows.length === 0) return;

  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Hasil Evaluasi');

  const headers = [
    'Evaluasi',
    'Nama',
    'NIM',
    'Perusahaan',
    'Nama Karyawan Dinilai',
    'Kesesuaian Jurusan',
    'Tanggal Submit',
  ];
  const headerRowIndex = 1;
  worksheet.addRow(headers);

  rows.forEach((row) => {
    worksheet.addRow([
      row.evaluation_title,
      row.nama,
      row.nim,
      row.company_name ?? '',
      row.employee_name ?? '',
      row.major_job_match === 'ya' ? 'Ya' : 'Tidak',
      row.submitted_at ? new Date(row.submitted_at).toLocaleString('id-ID') : '',
    ]);
  });

  const lastRowIndex = worksheet.rowCount;
  const headerRow = worksheet.getRow(headerRowIndex);
  headerRow.eachCell((cell) => {
    cell.font = { ...(cell.font ?? {}), bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9D9D9' },
    };
  });

  for (let rowIndex = headerRowIndex; rowIndex <= lastRowIndex; rowIndex++) {
    const row = worksheet.getRow(rowIndex);
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  }

  const columnCount = headers.length;
  for (let colIndex = 1; colIndex <= columnCount; colIndex++) {
    let maxLength = 0;
    const headerText = String(headers[colIndex - 1] ?? '');
    maxLength = Math.max(maxLength, headerText.length);
    for (let rowIndex = headerRowIndex; rowIndex <= lastRowIndex; rowIndex++) {
      const cell = worksheet.getRow(rowIndex).getCell(colIndex);
      const v = cell.value;
      if (v != null) maxLength = Math.max(maxLength, String(v).length);
    }
    worksheet.getColumn(colIndex).width = Math.min(Math.max(maxLength + 2, 10), 50);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
