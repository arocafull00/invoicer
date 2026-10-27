ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS whatsapp_reminder BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS whatsapp_reminder_settings (
    user_id TEXT PRIMARY KEY,
    phone TEXT NOT NULL,
    api_key_encrypted TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT false,
    last_test_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS whatsapp_reminder_deliveries (
    user_id TEXT NOT NULL REFERENCES whatsapp_reminder_settings(user_id) ON DELETE CASCADE,
    reminder_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('processing', 'queued', 'failed', 'unknown')),
    messages JSONB NOT NULL,
    queued_parts INTEGER NOT NULL DEFAULT 0 CHECK (queued_parts >= 0),
    event_count INTEGER NOT NULL,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    queued_at TIMESTAMPTZ,
    error TEXT,
    PRIMARY KEY (user_id, reminder_date)
);
