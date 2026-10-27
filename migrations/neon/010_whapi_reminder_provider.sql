ALTER TABLE whatsapp_reminder_settings
    ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'callmebot'
    CHECK (provider IN ('callmebot', 'whapi'));

UPDATE whatsapp_reminder_settings
SET enabled = false, updated_at = NOW()
WHERE provider = 'callmebot';

ALTER TABLE whatsapp_reminder_settings
    ALTER COLUMN provider SET DEFAULT 'whapi';
