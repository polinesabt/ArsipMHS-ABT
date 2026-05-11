<?php

/**
 * Resolve current active satisfaction template with self-healing rules:
 * - If multiple active non-deleted templates exist, keep newest and deactivate others.
 * - If none active, auto-activate default template.
 * - Normalize definition format to ensure sections is always an array.
 *
 * @return array{
 *   template: array{
 *     id:string,
 *     title:string,
 *     definition:array,
 *     is_default:bool,
 *     is_active:bool,
 *     created_at:?string,
 *     updated_at:?string
 *   },
 *   resolved_via:string
 * }
 */
function resolveCurrentSatisfactionTemplate(PDO $pdo, array $opts = []): array
{
    $activeStmt = $pdo->query("
        SELECT id, title, definition, is_default, is_active, created_at, updated_at
        FROM satisfaction_form_templates
        WHERE deleted_at IS NULL AND is_active = 1
        ORDER BY updated_at DESC, created_at DESC, id DESC
    ");
    $activeRows = $activeStmt ? $activeStmt->fetchAll(PDO::FETCH_ASSOC) : [];

    $resolvedVia = 'active';
    $resolvedId = '';

    if (count($activeRows) > 1) {
        $resolvedVia = 'self_healed_active';
        $resolvedId = (string)($activeRows[0]['id'] ?? '');
        $deactivateStmt = $pdo->prepare("
            UPDATE satisfaction_form_templates
            SET is_active = 0, updated_at = NOW()
            WHERE deleted_at IS NULL AND id <> ?
        ");
        $deactivateStmt->execute([$resolvedId]);
    } elseif (count($activeRows) === 1) {
        $resolvedId = (string)($activeRows[0]['id'] ?? '');
    } else {
        $resolvedVia = 'default_auto_activated';
        $defaultStmt = $pdo->query("
            SELECT id
            FROM satisfaction_form_templates
            WHERE deleted_at IS NULL AND is_default = 1
            ORDER BY updated_at DESC, created_at DESC, id DESC
            LIMIT 1
        ");
        $defaultRow = $defaultStmt ? $defaultStmt->fetch(PDO::FETCH_ASSOC) : null;
        if (!$defaultRow || empty($defaultRow['id'])) {
            throw new Exception('Template utama tidak ditemukan. Aktifkan atau buat template terlebih dahulu.');
        }
        $resolvedId = (string)$defaultRow['id'];
        $activateStmt = $pdo->prepare("
            UPDATE satisfaction_form_templates
            SET is_active = 1, updated_at = NOW()
            WHERE id = ? AND deleted_at IS NULL
        ");
        $activateStmt->execute([$resolvedId]);
    }

    if ($resolvedId === '') {
        throw new Exception('Gagal menentukan template aktif.');
    }

    $resolvedStmt = $pdo->prepare("
        SELECT id, title, definition, is_default, is_active, created_at, updated_at
        FROM satisfaction_form_templates
        WHERE id = ? AND deleted_at IS NULL
        LIMIT 1
    ");
    $resolvedStmt->execute([$resolvedId]);
    $template = $resolvedStmt->fetch(PDO::FETCH_ASSOC);

    if (!$template) {
        throw new Exception('Template aktif tidak ditemukan.');
    }

    $definition = is_string($template['definition'] ?? null)
        ? json_decode((string)$template['definition'], true)
        : ($template['definition'] ?? []);
    if (!is_array($definition)) {
        $definition = [];
    }
    if (!isset($definition['sections']) || !is_array($definition['sections'])) {
        $definition['sections'] = [];
    }

    return [
        'template' => [
            'id' => (string)$template['id'],
            'title' => (string)$template['title'],
            'definition' => $definition,
            'is_default' => !empty($template['is_default']),
            'is_active' => !empty($template['is_active']),
            'created_at' => isset($template['created_at']) ? (string)$template['created_at'] : null,
            'updated_at' => isset($template['updated_at']) ? (string)$template['updated_at'] : null,
        ],
        'resolved_via' => $resolvedVia,
    ];
}

