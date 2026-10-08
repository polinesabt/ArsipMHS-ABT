const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'kepuasan pengguna', 'Master DB Kepuasan Pengguna (2).xlsx');
const output = path.join(root, 'kepuasan pengguna', 'hasil');
const recordsFile = path.join(output, 'records.json');
const statusFile = path.join(output, 'download-status.json');

function scalar(value) {
  if (value == null) return '';
  if (typeof value === 'object') {
    if (value.richText) return value.richText.map(item => item.text).join('');
    if (value.result != null) return String(value.result);
    return String(value.text || '');
  }
  return String(value).trim();
}

function quote(value) {
  if (value == null) return 'NULL';
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "''").replace(/\u0000/g, '')}'`;
}

function sqlRow(values) {
  return '(' + values.map(value => typeof value === 'number' ? String(value) : quote(value)).join(', ') + ')';
}

async function extract() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(source);
  const records = [];
  const warnings = [];
  const labels = ['Sangat Baik', 'Baik', 'Cukup Baik', 'Kurang Baik', 'Tidak Baik'];
  const categories = ['bekerja', 'studi_lanjut', 'wirausaha'];
  workbook.worksheets.forEach((sheet, index) => {
    const category = categories[index];
    if (!category) throw new Error(`Sheet tidak dikenali: ${sheet.name}`);
    const start = category === 'bekerja' ? 3 : 2;
    for (let rowNumber = start; rowNumber <= sheet.rowCount; rowNumber++) {
      const row = sheet.getRow(rowNumber);
      if (!row.getCell(2).value && !row.getCell(3).value) continue;
      const link = row.getCell(6).value;
      const url = link && typeof link === 'object' ? link.hyperlink : null;
      const fileMatch = url && /^https:\/\/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)\//.exec(url);
      const openMatch = url && /^https:\/\/drive\.google\.com\/open\?/.test(url) ? new URL(url).searchParams.get('id') : null;
      const driveId = fileMatch ? fileMatch[1] : openMatch;
      if (!driveId || !/^[A-Za-z0-9_-]+$/.test(driveId)) warnings.push(`${sheet.name} baris ${rowNumber}: tautan Drive tidak valid`);
      const rating = [];
      if (category === 'bekerja') {
        for (let column = 7; column <= 56; column += 5) {
          const indicator = scalar(sheet.getRow(1).getCell(column).value);
          const selected = [];
          for (let offset = 0; offset < 5; offset++) {
            const cellValue = row.getCell(column + offset).value;
            if (cellValue != null && cellValue !== '') {
              if (Number(cellValue) === 1) selected.push(offset);
              else warnings.push(`${sheet.name} baris ${rowNumber}, kolom ${column + offset}: nilai tidak dikenal ${cellValue}`);
            }
          }
          if (selected.length > 1) warnings.push(`${sheet.name} baris ${rowNumber}, ${indicator}: lebih dari satu pilihan`);
          if (selected.length === 1) rating.push({ indicator, label: labels[selected[0]], score: 5 - selected[0] });
        }
      }
      const number = Number(row.getCell(1).value);
      const year = Number(row.getCell(5).value);
      if (!Number.isInteger(number) || !Number.isInteger(year)) warnings.push(`${sheet.name} baris ${rowNumber}: nomor/tahun tidak valid`);
      records.push({
        id: `${category}:${rowNumber}`,
        category,
        sheet: sheet.name,
        row: rowNumber,
        number,
        name: scalar(row.getCell(2).value),
        nim: scalar(row.getCell(3).value),
        class: scalar(row.getCell(4).value),
        year,
        proofName: scalar(link),
        driveUrl: url || null,
        driveId: driveId || null,
        rating,
      });
    }
  });
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(recordsFile, JSON.stringify(records, null, 2) + '\n');
  fs.writeFileSync(path.join(output, 'validasi.json'), JSON.stringify({ total: records.length, ratings: records.reduce((sum, r) => sum + r.rating.length, 0), warnings }, null, 2) + '\n');
  console.log(`Extracted ${records.length} records, ${records.reduce((sum, r) => sum + r.rating.length, 0)} ratings, ${warnings.length} warnings`);
  if (warnings.length) console.log(warnings.join('\n'));
}

function buildSql() {
  const records = JSON.parse(fs.readFileSync(recordsFile, 'utf8'));
  const statuses = fs.existsSync(statusFile) ? JSON.parse(fs.readFileSync(statusFile, 'utf8')) : {};
  const header = `-- Impor Master DB Kepuasan Pengguna (2).xlsx; pilih database target di phpMyAdmin sebelum mengimpor.
-- 34 entri dari 3 sheet. Aman diimpor ulang: primary key berbasis nama sheet dan nomor baris.
-- Berkas bukti berada di backend/storage/satisfaction_import/ pada hosting.
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS import_kepuasan_pengguna (
  id VARCHAR(32) NOT NULL PRIMARY KEY,
  kategori ENUM('bekerja','studi_lanjut','wirausaha') NOT NULL,
  nama_sheet VARCHAR(100) NOT NULL,
  nomor_baris INT NOT NULL,
  nomor_urut INT NOT NULL,
  nama_mahasiswa VARCHAR(255) NOT NULL,
  nim VARCHAR(32) NOT NULL,
  kelas VARCHAR(32) NOT NULL,
  tahun_lulus SMALLINT UNSIGNED NOT NULL,
  nama_bukti VARCHAR(255) DEFAULT NULL,
  gdrive_url TEXT DEFAULT NULL,
  gdrive_file_id VARCHAR(128) DEFAULT NULL,
  bukti_local_path VARCHAR(255) DEFAULT NULL,
  UNIQUE KEY uq_import_kepuasan_baris (kategori, nomor_baris),
  KEY idx_import_kepuasan_nim (nim),
  KEY idx_import_kepuasan_tahun (tahun_lulus)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS import_kepuasan_penilaian (
  record_id VARCHAR(32) NOT NULL,
  indikator VARCHAR(150) NOT NULL,
  label_penilaian ENUM('Sangat Baik','Baik','Cukup Baik','Kurang Baik','Tidak Baik') NOT NULL,
  skor TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (record_id, indikator),
  CONSTRAINT fk_import_kepuasan_penilaian_record FOREIGN KEY (record_id)
    REFERENCES import_kepuasan_pengguna(id) ON DELETE CASCADE,
  CHECK (skor BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;
  const rows = records.map(record => sqlRow([
    record.id, record.category, record.sheet, record.row, record.number,
    record.name, record.nim, record.class, record.year,
    record.proofName || null, record.driveUrl, record.driveId,
    statuses[record.id]?.ok ? statuses[record.id].path : null,
  ]));
  const ratings = records.flatMap(record => record.rating.map(item => sqlRow([record.id, item.indicator, item.label, item.score])));
  const sql = header +
    'INSERT INTO import_kepuasan_pengguna (id, kategori, nama_sheet, nomor_baris, nomor_urut, nama_mahasiswa, nim, kelas, tahun_lulus, nama_bukti, gdrive_url, gdrive_file_id, bukti_local_path) VALUES\n' +
    rows.join(',\n') + '\nON DUPLICATE KEY UPDATE nama_mahasiswa=VALUES(nama_mahasiswa), nim=VALUES(nim), kelas=VALUES(kelas), tahun_lulus=VALUES(tahun_lulus), nama_bukti=VALUES(nama_bukti), gdrive_url=VALUES(gdrive_url), gdrive_file_id=VALUES(gdrive_file_id), bukti_local_path=VALUES(bukti_local_path);\n\n' +
    'INSERT INTO import_kepuasan_penilaian (record_id, indikator, label_penilaian, skor) VALUES\n' +
    ratings.join(',\n') + '\nON DUPLICATE KEY UPDATE label_penilaian=VALUES(label_penilaian), skor=VALUES(skor);\n';
  const target = path.join(output, 'impor_kepuasan_pengguna.sql');
  fs.writeFileSync(target, sql, 'utf8');
  console.log(`Wrote ${target}`);
}

(async () => {
  if (process.argv[2] !== '--sql-only') await extract();
  buildSql();
})().catch(error => { console.error(error); process.exitCode = 1; });
