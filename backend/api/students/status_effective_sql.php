<?php
/**
 * Student effective status SQL helper.
 *
 * Rules (decision-complete):
 * - status_mode = 'manual'  -> status_effective = students.status
 * - status_mode = 'auto'    -> only 'active' or 'alumni', computed from tahun_masuk/tahun_lulus (4-year estimation)
 *   - if tahun_lulus is not null AND tahun_lulus <= YEAR(CURDATE()) -> 'alumni'
 *   - else if tahun_lulus is null AND YEAR(CURDATE()) >= (tahun_masuk + 4) -> 'alumni'
 *   - else -> 'active'
 */

function student_status_effective_expr(string $alias = 's'): string
{
    $safeAlias = preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/', $alias) ? $alias : 's';

    return "CASE
        WHEN {$safeAlias}.status_mode = 'manual' THEN {$safeAlias}.status
        WHEN {$safeAlias}.status_mode = 'auto' THEN
            CASE
                WHEN {$safeAlias}.tahun_lulus IS NOT NULL AND {$safeAlias}.tahun_lulus <= YEAR(CURDATE()) THEN 'alumni'
                WHEN {$safeAlias}.tahun_lulus IS NULL AND YEAR(CURDATE()) >= ({$safeAlias}.tahun_masuk + 4) THEN 'alumni'
                ELSE 'active'
            END
        ELSE {$safeAlias}.status
    END";
}

// Backward-compatible alias (older code may call plural form).
function students_status_effective_expr(string $alias = 's'): string
{
    return student_status_effective_expr($alias);
}
