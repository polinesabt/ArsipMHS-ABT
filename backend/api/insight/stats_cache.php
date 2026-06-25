<?php

function getInsightStatsCacheDir(): string {
    $cacheDir = __DIR__ . '/../../storage/insight_stats_cache';
    if (!is_dir($cacheDir)) {
        @mkdir($cacheDir, 0755, true);
    }
    return $cacheDir;
}

function buildInsightStatsCacheKey(string $section, ?int $yearFilter, ?string $tabFilter, ?string $lastSyncedAt): string {
    $parts = [
        $section,
        $yearFilter !== null ? (string)$yearFilter : 'all',
        $tabFilter !== null ? $tabFilter : 'all',
        $lastSyncedAt ?? 'unsynced',
    ];
    return md5(implode('|', $parts));
}

function getInsightStatsCacheFilePath(string $cacheKey): string {
    return getInsightStatsCacheDir() . '/' . $cacheKey . '.json';
}

function loadInsightStatsCache(string $cacheKey): ?array {
    $cacheFile = getInsightStatsCacheFilePath($cacheKey);
    if (!is_file($cacheFile)) {
        return null;
    }

    $contents = @file_get_contents($cacheFile);
    if ($contents === false) {
        return null;
    }

    $decoded = json_decode($contents, true);
    return is_array($decoded) ? $decoded : null;
}

function saveInsightStatsCache(string $cacheKey, array $payload): void {
    $cacheFile = getInsightStatsCacheFilePath($cacheKey);
    $encoded = json_encode($payload, JSON_UNESCAPED_UNICODE);
    if ($encoded === false) {
        return;
    }

    @file_put_contents($cacheFile, $encoded, LOCK_EX);
}
