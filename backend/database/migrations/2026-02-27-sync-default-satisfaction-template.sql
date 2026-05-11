-- Sync default custom satisfaction template with current legacy survey structure.
-- Safe update: only runs when default template is still old minimal seed (single comment question).

SET NAMES utf8mb4;

UPDATE satisfaction_form_templates
SET
  definition = JSON_OBJECT(
    'sections', JSON_ARRAY(
      JSON_OBJECT(
        'id', 'sec-company-name',
        'title', 'Nama Perusahaan',
        'required', TRUE,
        'type', 'open',
        'placeholder', 'Contoh: PT Maju Sejahtera',
        'inputType', 'text'
      ),
      JSON_OBJECT(
        'id', 'sec-company-address',
        'title', 'Alamat Perusahaan',
        'required', TRUE,
        'type', 'open',
        'placeholder', 'Contoh: Jl. Sudirman No. 10, Semarang',
        'inputType', 'text'
      ),
      JSON_OBJECT(
        'id', 'sec-employee-name',
        'title', 'Nama Karyawan yang Dinilai',
        'required', TRUE,
        'type', 'open',
        'placeholder', 'Nama karyawan',
        'inputType', 'text',
        'prefillFrom', 'student.nama'
      ),
      JSON_OBJECT(
        'id', 'sec-graduation-year',
        'title', 'Tahun Lulus',
        'required', TRUE,
        'type', 'open',
        'placeholder', 'Contoh: 2024',
        'inputType', 'number',
        'prefillFrom', 'student.tahun_lulus'
      ),
      JSON_OBJECT(
        'id', 'sec-study-program',
        'title', 'Program Studi',
        'required', TRUE,
        'type', 'open',
        'placeholder', 'Contoh: Administrasi Bisnis Terapan',
        'inputType', 'text',
        'prefillFrom', 'student.prodi'
      ),
      JSON_OBJECT(
        'id', 'sec-current-work-division',
        'title', 'Bagian / Bidang Kerja Saat Ini',
        'required', TRUE,
        'type', 'open',
        'placeholder', 'Contoh: Operasional, HR, Keuangan',
        'inputType', 'text'
      ),
      JSON_OBJECT(
        'id', 'sec-major-job-match',
        'title', 'Bagian 2 - Kesesuaian Jurusan dengan Pekerjaan',
        'required', TRUE,
        'type', 'multiple_choice',
        'allowMultiple', FALSE,
        'allowOther', FALSE,
        'options', JSON_ARRAY('Ya', 'Tidak')
      ),
      JSON_OBJECT(
        'id', 'sec-competency-rating',
        'title', 'Bagian 3 - Tabel Penilaian Kompetensi',
        'required', TRUE,
        'type', 'scale',
        'scaleMin', 1,
        'scaleMax', 5,
        'questionSource', 'evaluation_aspects',
        'questions', JSON_ARRAY(
          JSON_OBJECT('id', 'asp-001', 'title', 'Etika'),
          JSON_OBJECT('id', 'asp-002', 'title', 'Keahlian pada bidang ilmu (kompetensi utama)'),
          JSON_OBJECT('id', 'asp-003', 'title', 'Kemampuan berbahasa asing'),
          JSON_OBJECT('id', 'asp-004', 'title', 'Penggunaan teknologi informasi'),
          JSON_OBJECT('id', 'asp-005', 'title', 'Kemampuan berkomunikasi'),
          JSON_OBJECT('id', 'asp-006', 'title', 'Kerjasama'),
          JSON_OBJECT('id', 'asp-007', 'title', 'Pengembangan diri'),
          JSON_OBJECT('id', 'asp-008', 'title', 'Loyalitas terhadap tujuan perusahaan'),
          JSON_OBJECT('id', 'asp-009', 'title', 'Integritas diri dalam pergaulan di perusahaan'),
          JSON_OBJECT('id', 'asp-010', 'title', 'Kemampuan mengelola waktu kerja')
        )
      )
    )
  ),
  updated_at = CURRENT_TIMESTAMP
WHERE id = 'a0000001-0000-4000-8000-000000000001'
  AND deleted_at IS NULL
  AND JSON_LENGTH(JSON_EXTRACT(definition, '$.sections')) = 1
  AND JSON_UNQUOTE(JSON_EXTRACT(definition, '$.sections[0].id')) = 'sec-default-1'
  AND JSON_UNQUOTE(JSON_EXTRACT(definition, '$.sections[0].type')) = 'open'
  AND JSON_UNQUOTE(JSON_EXTRACT(definition, '$.sections[0].title')) = 'Komentar atau saran';

