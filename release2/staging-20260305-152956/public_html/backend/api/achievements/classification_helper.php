<?php

function normalizeAchievementType(string $value): string {
    $normalized = strtolower(trim($value));
    if ($normalized === 'academic') {
        return 'academic';
    }
    return 'non_academic';
}

function researchOutputBookSubcategories(): array {
    return ['isbn_book', 'book_chapter'];
}

function researchOutputHakiSubcategories(): array {
    return [
        'trademark',
        'patent',
        'simple_patent',
        'industrial_design',
        'copyright',
        'geographical_indication',
        'trade_secret',
        'circuit_layout',
    ];
}

function researchOutputTechnologySubcategories(): array {
    return [
        'software_development',
        'technology_product',
        'standardized_product',
        'certified_product',
        'social_engineering',
        'consulting_mentoring',
    ];
}

function researchOutputAllSubcategories(): array {
    return array_merge(
        researchOutputHakiSubcategories(),
        researchOutputTechnologySubcategories(),
        researchOutputBookSubcategories()
    );
}

function isResearchOutputSubcategory(string $subcategory): bool {
    $normalized = strtolower(trim($subcategory));
    return in_array($normalized, researchOutputAllSubcategories(), true);
}

function normalizeResearchOutputSubcategory(string $value): string {
    $normalized = strtolower(trim($value));
    if ($normalized === '') {
        return '';
    }

    $normalized = str_replace(['-', ' '], '_', $normalized);
    $aliases = [
        'merek' => 'trademark',
        'merek_dagang' => 'trademark',
        'paten' => 'patent',
        'paten_sederhana' => 'simple_patent',
        'simple_patent' => 'simple_patent',
        'hak_cipta' => 'copyright',
        'copyright' => 'copyright',
        'desain_industri' => 'industrial_design',
        'industrial_design' => 'industrial_design',
        'indikasi_geografis' => 'geographical_indication',
        'geographical_indication' => 'geographical_indication',
        'rahasia_dagang' => 'trade_secret',
        'trade_secret' => 'trade_secret',
        'desain_tata_letak_sirkuit_terpadu' => 'circuit_layout',
        'circuit_layout' => 'circuit_layout',
        'teknologi_tepat_guna' => 'technology_product',
        'produk' => 'technology_product',
        'produk_terstandarisasi' => 'standardized_product',
        'produk_tersertifikasi' => 'certified_product',
        'rekayasa_sosial' => 'social_engineering',
        'konsultasi_pendampingan' => 'consulting_mentoring',
        'konsultasi' => 'consulting_mentoring',
        'pendampingan' => 'consulting_mentoring',
        'software' => 'software_development',
        'software_development' => 'software_development',
        'pengembangan_software' => 'software_development',
        'buku_ber_isbn' => 'isbn_book',
        'buku_isbn' => 'isbn_book',
        'isbn_book' => 'isbn_book',
        'book_chapter' => 'book_chapter',
        'bab_buku' => 'book_chapter',
    ];

    return $aliases[$normalized] ?? $normalized;
}

function deriveAchievementTypeFromCategory(string $category, string $subcategory): string {
    $categoryValue = strtolower(trim($category));
    $subcategoryValue = strtolower(trim($subcategory));
    if ($categoryValue === 'research_output') {
        $normalizedSubtype = normalizeResearchOutputSubcategory($subcategoryValue);
        if (in_array($normalizedSubtype, researchOutputBookSubcategories(), true)) {
            return 'academic';
        }
        return 'non_academic';
    }

    if ($categoryValue === 'scientific_work') {
        return 'academic';
    }
    if ($categoryValue === 'applied_academic' && $subcategoryValue === 'course_portfolio') {
        return 'academic';
    }
    return 'non_academic';
}

function achievementTypeLabel(string $type): string {
    return normalizeAchievementType($type) === 'academic'
        ? 'Prestasi Akademik'
        : 'Prestasi Non Akademik';
}
