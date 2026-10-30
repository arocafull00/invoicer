ALTER TABLE expenses ADD COLUMN IF NOT EXISTS fiscal_date DATE;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS provider_nif TEXT NOT NULL DEFAULT '';
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS retention_amount NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS deductible_base_pct NUMERIC(5,2) NOT NULL DEFAULT 100 CHECK (deductible_base_pct BETWEEN 0 AND 100);
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS deductible_vat_pct NUMERIC(5,2) NOT NULL DEFAULT 100 CHECK (deductible_vat_pct BETWEEN 0 AND 100);
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'EUR' CHECK (currency = 'EUR');
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS source_hash TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS import_identity TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS expenses_user_source_hash ON expenses(user_id, source_hash) WHERE source_hash IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS expenses_user_import_identity ON expenses(user_id, import_identity) WHERE import_identity IS NOT NULL;
CREATE INDEX IF NOT EXISTS expenses_user_fiscal_date ON expenses(user_id, fiscal_date);
CREATE TABLE IF NOT EXISTS expense_documents (
  expense_id UUID PRIMARY KEY REFERENCES expenses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  content BYTEA NOT NULL CHECK (octet_length(content) <= 3145728),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS expense_documents_user ON expense_documents(user_id);
CREATE TABLE IF NOT EXISTS tax_period_settings (
  user_id TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year BETWEEN 2000 AND 2200),
  quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  model130_required BOOLEAN NOT NULL DEFAULT TRUE,
  prior_irpf_payments NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (prior_irpf_payments >= 0),
  vat_credit NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (vat_credit >= 0),
  PRIMARY KEY(user_id, year, quarter)
);
