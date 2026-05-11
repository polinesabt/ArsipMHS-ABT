<?php
require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/auth.php';
require_once __DIR__ . '/../store_helper.php';
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/category_definitions.php';

try {
    requireAuth('admin');
    prestasi_import_require_spreadsheet();

    $kategori = isset($_GET['kategori']) ? trim((string)$_GET['kategori']) : '';
    $definition = prestasi_import_resolve_definition($kategori);
    if (!$definition) {
        throw new Exception('Kategori import tidak valid.');
    }

    $stmt = $pdo->prepare("SELECT nim, nama FROM students WHERE deleted_at IS NULL ORDER BY nim ASC");
    $stmt->execute();
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setTitle('Template');

    $headers = ['NIM', 'Nama'];
    foreach ($definition['fields'] as $field) {
        $headers[] = prestasi_import_field_display_label($field);
    }

    $lastColumnIndex = count($headers);
    $lastColumnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($lastColumnIndex);
    $headerRow = 8;
    $dataStartRow = $headerRow + 1;

    // Catatan pengisian di atas (informatif, tanpa freeze pane)
    $sheet->setCellValue('A1', 'Catatan Pengisian Template Import Prestasi');
    $sheet->setCellValue('A2', '1) Satu baris = satu prestasi mahasiswa.');
    $sheet->setCellValue('A3', '2) Jika 1 mahasiswa punya 2 prestasi, duplikasi NIM dan Nama di baris berikutnya lalu isi detail prestasi yang berbeda.');
    $sheet->setCellValue('A4', '3) Header kolom tabel wajib tetap sama, jangan diubah.');
    $sheet->setCellValue('A5', '4) Anda boleh menambah baris baru di bawah tabel sesuai kebutuhan.');
    $sheet->setCellValue('A6', '5) Kolom bertanda * wajib diisi. Untuk kolom select, wajib pilih dari dropdown (nilai canonical key).');

    $sheet->mergeCells(sprintf('A1:%s1', $lastColumnLetter));
    foreach (range(2, 6) as $noteRow) {
        $sheet->mergeCells(sprintf('A%d:%s%d', $noteRow, $lastColumnLetter, $noteRow));
    }

    $titleRange = sprintf('A1:%s1', $lastColumnLetter);
    $notesRange = sprintf('A2:%s6', $lastColumnLetter);
    $sheet->getStyle($titleRange)->getFont()->setBold(true)->setSize(12);
    $sheet->getStyle($titleRange)->getFill()
        ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
        ->getStartColor()->setARGB('FFEFF6FF');
    $sheet->getStyle($titleRange)->getAlignment()
        ->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_LEFT)
        ->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);

    $sheet->getStyle($notesRange)->getFill()
        ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
        ->getStartColor()->setARGB('FFF8FAFC');
    $sheet->getStyle($notesRange)->getAlignment()
        ->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_LEFT)
        ->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_TOP)
        ->setWrapText(true);

    foreach (range(2, 6) as $noteRow) {
        $sheet->getRowDimension($noteRow)->setRowHeight(30);
    }

    // Tabel data: header baris 8, data dari baris 9
    $sheet->fromArray($headers, null, sprintf('A%d', $headerRow));

    $rowNumber = $dataStartRow;
    foreach ($students as $student) {
        $nimCell = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(1) . $rowNumber;
        $namaCell = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(2) . $rowNumber;
        $sheet->setCellValue($nimCell, (string)$student['nim']);
        $sheet->setCellValue($namaCell, (string)$student['nama']);
        $rowNumber++;
    }

    $headerRange = sprintf('A%d:%s%d', $headerRow, $lastColumnLetter, $headerRow);
    $sheet->getStyle($headerRange)->getFont()->setBold(true);
    $sheet->getStyle($headerRange)->getFill()
        ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
        ->getStartColor()->setARGB('FFE8EFFA');

    foreach (range(1, $lastColumnIndex) as $colIdx) {
        $column = $sheet->getColumnDimensionByColumn($colIdx);
        if ($colIdx <= 2) {
            $column->setWidth(20);
        } else {
            $column->setWidth(28);
        }
    }

    $optionsSheet = $spreadsheet->createSheet();
    $optionsSheet->setTitle('_options');
    $optionColumnIndex = 1;
    $validationMaxRow = max($dataStartRow + max(1000, count($students) + 200), $dataStartRow + 1000);

    foreach ($definition['fields'] as $fieldIndex => $field) {
        $options = prestasi_import_field_option_values($field);
        if (count($options) === 0) {
            continue;
        }

        $optionColumnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($optionColumnIndex);
        $optionsSheet->setCellValue($optionColumnLetter . '1', (string)$field['key']);

        $optionRow = 2;
        foreach ($options as $optionValue) {
            $optionsSheet->setCellValue($optionColumnLetter . $optionRow, (string)$optionValue);
            $optionRow++;
        }

        $optionEndRow = max(2, $optionRow - 1);
        $formula = sprintf("'_options'!$%s$2:$%s$%d", $optionColumnLetter, $optionColumnLetter, $optionEndRow);

        $sheetColumnIndex = $fieldIndex + 3; // A:NIM, B:Nama, field mulai dari C
        $sheetColumnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($sheetColumnIndex);

        for ($rowIdx = $dataStartRow; $rowIdx <= $validationMaxRow; $rowIdx++) {
            $validation = $sheet->getCell($sheetColumnLetter . $rowIdx)->getDataValidation();
            $validation->setType(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::TYPE_LIST);
            $validation->setErrorStyle(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::STYLE_STOP);
            $validation->setAllowBlank(!(bool)($field['required'] ?? false));
            $validation->setShowInputMessage(true);
            $validation->setShowErrorMessage(true);
            $validation->setShowDropDown(true);
            $validation->setErrorTitle('Nilai tidak valid');
            $validation->setError('Pilih salah satu nilai dari dropdown yang tersedia.');
            $validation->setFormula1($formula);
        }

        $optionColumnIndex++;
    }

    $optionsSheet->setSheetState(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::SHEETSTATE_HIDDEN);

    $meta = $spreadsheet->createSheet();
    $meta->setTitle('_meta');
    $meta->setCellValue('A1', 'template_version');
    $meta->setCellValueExplicit('B1', '2.0', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
    $meta->setCellValue('A2', 'kategori');
    $meta->setCellValueExplicit('B2', $definition['key'], \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
    $meta->setSheetState(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::SHEETSTATE_HIDDEN);

    $spreadsheet->setActiveSheetIndex(0);

    $fileName = sprintf('template-import-prestasi-%s.xlsx', $definition['key']);

    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment;filename="' . $fileName . '"');
    header('Cache-Control: max-age=0');

    $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
    $writer->save('php://output');
    exit;
} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
