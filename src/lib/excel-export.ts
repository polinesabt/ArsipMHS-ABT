/**
 * Excel export utilities for student/alumni data.
 *
 * NOTE:
 * - This is purely a frontend concern; no backend or endpoint changes.
 * - Uses exceljs and runs fully in the browser.
 */

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
 * KOLOM OPSIONAL: Email, Nomor HP, Tahun Masuk, Tahun Lulus, Password, Status
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
      '',                          // index 7: Status (tidak ada di export, kosongkan)
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
 * Generate an official Excel template for importing student accounts.
 *
 * Template ini menggunakan standar yang sama dengan export data mahasiswa,
 * sehingga file export dapat langsung di-import kembali tanpa modifikasi.
 *
 * - Header row is on the first row (mengikuti standar)
 * - Minimal required columns: Nama, NIM
 * - Optional columns: Email, Nomor HP, Tahun Masuk, Tahun Lulus, Password, Status
 */
export async function exportStudentImportTemplate(): Promise<void> {
  const ExcelJS = await import('exceljs');

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Template Import Akun');

  // Header di baris 1 (mengikuti standar template)
  const headers = STUDENT_EXCEL_TEMPLATE.headers;
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
    new Date().getFullYear(),    // Tahun Masuk
    '',                          // Tahun Lulus
    '202312345',                 // Password (opsional, default = NIM jika kosong)
    'active',                    // Status (opsional)
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

