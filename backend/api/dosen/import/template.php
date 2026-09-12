<?php
declare(strict_types=1);

require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/definitions.php';

try {
    requireAuth('admin');
    dosen_import_require_spreadsheet();
    $module = trim((string)($_GET['module'] ?? ''));
    $definition = dosen_import_definition($module);
    if (!$definition) throw new InvalidArgumentException('Modul impor tidak valid.');

    $book = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
    $sheet = $book->getActiveSheet();
    $sheet->setTitle('Template');
    $columns = $definition['columns'];
    $last = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(count($columns));
    $sheet->setCellValue('A1','Template Import ' . $definition['title']);
    $sheet->setCellValue('A2','1) Jangan mengubah dua baris header atau sheet metadata.');
    $sheet->setCellValue('A3','2) NIDN/NIDK dan NIP dibaca sebagai teks agar angka nol di depan tetap tersimpan.');
    $sheet->setCellValue('A4','3) Baris identitas yang sudah ada tidak ditimpa; data riwayat baru tetap dapat ditambahkan.');
    $sheet->setCellValue('A5','4) Duplikasi Nama dan NIDN/NIDK pada baris tambahan untuk memasukkan lebih dari satu riwayat.');
    $sheet->setCellValue('A6','5) Gunakan nilai dropdown yang tersedia dan isi data mulai baris 10.');
    for ($row=1;$row<=6;$row++) $sheet->mergeCells("A{$row}:{$last}{$row}");
    $sheet->getStyle("A1:{$last}1")->getFont()->setBold(true)->setSize(13);
    $sheet->getStyle("A1:{$last}1")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setARGB('FFDCEBFA');
    $sheet->getStyle("A2:{$last}6")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setARGB('FFF5F7FA');

    $groups = [];
    foreach ($columns as $index=>$column) {
        $columnNumber = $index + 1;
        $letter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($columnNumber);
        if (!empty($column['group'])) {
            $group = $column['group'];
            if (!isset($groups[$group])) $groups[$group] = [$columnNumber,$columnNumber];
            $groups[$group][1] = $columnNumber;
            $sheet->setCellValue("{$letter}9",$column['label']);
        } else {
            $sheet->setCellValue("{$letter}8",$column['label']);
            $sheet->mergeCells("{$letter}8:{$letter}9");
        }
    }
    foreach ($groups as $label=>[$start,$end]) {
        $startLetter=\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($start);
        $endLetter=\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($end);
        $sheet->setCellValue("{$startLetter}8",$label);
        $sheet->mergeCells("{$startLetter}8:{$endLetter}8");
    }
    $sheet->getStyle("A8:{$last}9")->getFont()->setBold(true);
    $sheet->getStyle("A8:{$last}9")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setARGB('FFE8EFFA');
    $sheet->getStyle("A8:{$last}9")->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER)->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER)->setWrapText(true);
    $sheet->freezePane('A10');

    $dosenRows = [];
    if ($definition['prefill']) {
        $dosenRows = $pdo->query('SELECT nidn,nama FROM dosen WHERE deleted_at IS NULL ORDER BY nama')->fetchAll(PDO::FETCH_ASSOC);
        foreach ($dosenRows as $offset=>$dosen) {
            $row = 10 + $offset;
            foreach ($columns as $index=>$column) {
                $value = '';
                if ($column['key']==='no') $value = $offset + 1;
                if ($column['key']==='nama') $value = $dosen['nama'];
                if ($column['key']==='nidn') $value = $dosen['nidn'];
                $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($index + 1);
                $sheet->setCellValueExplicit("{$colLetter}{$row}", (string)$value, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
            }
        }
    }

    $options = $book->createSheet();
    $options->setTitle('_options');
    $optionColumn = 1;
    $validationEnd = max(1010, 10 + count($dosenRows) + 300);
    foreach ($columns as $index=>$column) {
        if (empty($column['options'])) continue;
        $optionLetter=\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($optionColumn);
        $options->setCellValue("{$optionLetter}1",$column['key']);
        foreach ($column['options'] as $i=>$value) $options->setCellValue("{$optionLetter}".($i+2),$value);
        $sheetLetter=\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($index+1);
        $formula="'_options'!\${$optionLetter}\$2:\${$optionLetter}\$".(count($column['options'])+1);
        for ($row=10;$row<=$validationEnd;$row++) {
            $validation=$sheet->getCell("{$sheetLetter}{$row}")->getDataValidation();
            $validation->setType(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::TYPE_LIST)->setAllowBlank(true)->setShowErrorMessage(true)->setShowDropDown(true)->setErrorTitle('Nilai tidak valid')->setError('Pilih nilai dari dropdown.')->setFormula1($formula);
        }
        $optionColumn++;
    }
    $options->setSheetState(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::SHEETSTATE_HIDDEN);
    $meta=$book->createSheet();
    $meta->setTitle('_meta');
    $meta->setCellValueExplicit('A1', 'template_version', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
    $meta->setCellValueExplicit('B1', '1.0', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
    $meta->setCellValueExplicit('A2', 'module', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
    $meta->setCellValueExplicit('B2', $module, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
    $meta->setSheetState(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::SHEETSTATE_HIDDEN);
    $book->setActiveSheetIndex(0);
    for ($i=1;$i<=count($columns);$i++) {
        $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($i);
        $sheet->getColumnDimension($colLetter)->setWidth($i<=3?22:28);
    }
    $nidnIndex = array_search('nidn',array_column($columns,'key'),true);
    $nipIndex = array_search('nip',array_column($columns,'key'),true);
    foreach ([$nidnIndex,$nipIndex] as $idx) {
        if ($idx!==false) {
            $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($idx + 1);
            $sheet->getStyle("{$colLetter}10:{$colLetter}{$validationEnd}")->getNumberFormat()->setFormatCode('@');
        }
    }

    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment;filename="template-import-dosen-'.$module.'.xlsx"');
    header('Cache-Control: max-age=0');
    (new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($book))->save('php://output');
    exit;
} catch (Throwable $error) {
    http_response_code($error instanceof InvalidArgumentException?422:500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success'=>false,'error'=>$error->getMessage()],JSON_UNESCAPED_UNICODE);
}
