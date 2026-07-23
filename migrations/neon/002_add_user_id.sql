ALTER TABLE consultants ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE payment_instructions ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE line_item_templates ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Backfill existing rows with your Clerk user id before setting NOT NULL:
-- UPDATE consultants SET user_id = '<CLERK_USER_ID>' WHERE user_id IS NULL;
-- UPDATE clients SET user_id = '<CLERK_USER_ID>' WHERE user_id IS NULL;
-- UPDATE payment_instructions SET user_id = '<CLERK_USER_ID>' WHERE user_id IS NULL;
-- UPDATE invoices SET user_id = '<CLERK_USER_ID>' WHERE user_id IS NULL;
-- UPDATE line_item_templates SET user_id = '<CLERK_USER_ID>' WHERE user_id IS NULL;
-- UPDATE user_settings SET user_id = '<CLERK_USER_ID>' WHERE user_id IS NULL;

ALTER TABLE consultants ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE clients ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE payment_instructions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE invoices ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE line_item_templates ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE user_settings ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE consultants DROP CONSTRAINT IF EXISTS consultants_email_key;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_number_key;
ALTER TABLE line_item_templates DROP CONSTRAINT IF EXISTS line_item_templates_description_key;

ALTER TABLE consultants DROP CONSTRAINT IF EXISTS consultants_user_id_email_key;
ALTER TABLE consultants ADD CONSTRAINT consultants_user_id_email_key UNIQUE (user_id, email);

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_user_id_number_key;
ALTER TABLE invoices ADD CONSTRAINT invoices_user_id_number_key UNIQUE (user_id, number);

ALTER TABLE line_item_templates DROP CONSTRAINT IF EXISTS line_item_templates_user_id_description_key;
ALTER TABLE line_item_templates ADD CONSTRAINT line_item_templates_user_id_description_key UNIQUE (user_id, description);

ALTER TABLE user_settings DROP CONSTRAINT IF EXISTS user_settings_user_id_key;
ALTER TABLE user_settings ADD CONSTRAINT user_settings_user_id_key UNIQUE (user_id);

CREATE INDEX IF NOT EXISTS idx_consultants_user_id ON consultants(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_instructions_user_id ON payment_instructions(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_line_item_templates_user_id ON line_item_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
