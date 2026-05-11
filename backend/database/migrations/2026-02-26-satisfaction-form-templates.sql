-- Custom Form Kepuasan Pengguna: templates and responses.
-- One default template (is_default=1) cannot be deleted/edited from UI.
-- Only one template can be active (is_active=1) at a time.

SET NAMES utf8mb4;

-- Templates: form definition stored as JSON (sections with type, required, options, etc.)
CREATE TABLE IF NOT EXISTS satisfaction_form_templates (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  title VARCHAR(255) NOT NULL COMMENT 'Template display name',
  definition JSON NOT NULL COMMENT 'Sections and items: type, required, options, scale_min/max, etc.',
  is_default BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Default template; only one row should be true; cannot delete/edit from UI',
  is_active BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Template currently used for surveys; only one row should be true',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL COMMENT 'Soft delete for recycle bin',
  deleted_by VARCHAR(36) NULL COMMENT 'Admin user id that moved to recycle bin',

  INDEX idx_satisfaction_templates_deleted (deleted_at),
  INDEX idx_satisfaction_templates_default (is_default),
  INDEX idx_satisfaction_templates_active (is_active),
  INDEX idx_satisfaction_templates_updated (updated_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Custom user satisfaction form templates';

-- Responses: one per invitation when using custom form
CREATE TABLE IF NOT EXISTS satisfaction_form_responses (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  invitation_id VARCHAR(36) NOT NULL COMMENT 'FK evaluation_invitations',
  template_id VARCHAR(36) NOT NULL COMMENT 'FK satisfaction_form_templates (snapshot of form used)',
  answers JSON NOT NULL COMMENT 'Section/item id to value or file reference',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uk_satisfaction_response_invitation (invitation_id),
  FOREIGN KEY (invitation_id) REFERENCES evaluation_invitations(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES satisfaction_form_templates(id) ON DELETE RESTRICT,
  INDEX idx_satisfaction_responses_template (template_id),
  INDEX idx_satisfaction_responses_submitted (submitted_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Custom form responses per invitation';

-- Seed default template (minimal structure: one open section). Fixed ID so re-run is safe.
INSERT IGNORE INTO satisfaction_form_templates (id, title, definition, is_default, is_active, created_at, updated_at)
VALUES (
  'a0000001-0000-4000-8000-000000000001',
  'Template Utama Kepuasan Pengguna',
  JSON_OBJECT(
    'sections', JSON_ARRAY(
      JSON_OBJECT(
        'id', 'sec-default-1',
        'title', 'Komentar atau saran',
        'required', true,
        'type', 'open',
        'placeholder', 'Tulis komentar atau saran Anda di sini...'
      )
    )
  ),
  1,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
