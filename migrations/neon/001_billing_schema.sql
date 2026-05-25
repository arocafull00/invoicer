CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS consultants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    nif TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    company_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_instructions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    account_holder TEXT NOT NULL,
    iban TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    payment_terms TEXT NOT NULL,
    additional_data TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    number TEXT NOT NULL UNIQUE,
    created_date DATE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    consultant_id UUID REFERENCES consultants(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    payment_instructions_id UUID REFERENCES payment_instructions(id) ON DELETE SET NULL,
    description TEXT NOT NULL DEFAULT '',
    subtotal DECIMAL(10,2),
    vat_rate DECIMAL(5,2) DEFAULT 0,
    vat_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    vat_exempt BOOLEAN DEFAULT true,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
    deleted BOOLEAN DEFAULT false,
    irpf_rate DECIMAL(5,2),
    irpf_amount DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_line_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    rate DECIMAL(10,2) NOT NULL CHECK (rate >= 0),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    include_vat BOOLEAN NOT NULL DEFAULT false,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS line_item_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    description TEXT NOT NULL UNIQUE,
    default_quantity INTEGER NOT NULL DEFAULT 1 CHECK (default_quantity > 0),
    default_rate DECIMAL(10,2) NOT NULL CHECK (default_rate >= 0),
    category TEXT,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    default_currency TEXT NOT NULL DEFAULT 'eur' CHECK (default_currency IN ('eur', 'usd', 'gbp')),
    date_format TEXT NOT NULL DEFAULT 'dd/mm/yyyy' CHECK (date_format IN ('dd/mm/yyyy', 'mm/dd/yyyy', 'yyyy-mm-dd')),
    pdf_color_palette TEXT CHECK (pdf_color_palette IN ('violet', 'blue', 'emerald', 'rose')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultants_email ON consultants(email);
CREATE INDEX IF NOT EXISTS idx_consultants_name ON consultants(name);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_invoices_created_date ON invoices(created_date);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(number);
CREATE INDEX IF NOT EXISTS idx_invoices_consultant_id ON invoices(consultant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_deleted ON invoices(deleted);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_order ON invoice_line_items(invoice_id, order_index);
CREATE INDEX IF NOT EXISTS idx_line_item_templates_description ON line_item_templates(description);
CREATE INDEX IF NOT EXISTS idx_line_item_templates_usage ON line_item_templates(usage_count DESC);

DROP TRIGGER IF EXISTS update_consultants_updated_at ON consultants;
CREATE TRIGGER update_consultants_updated_at
    BEFORE UPDATE ON consultants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_instructions_updated_at ON payment_instructions;
CREATE TRIGGER update_payment_instructions_updated_at
    BEFORE UPDATE ON payment_instructions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoice_line_items_updated_at ON invoice_line_items;
CREATE TRIGGER update_invoice_line_items_updated_at
    BEFORE UPDATE ON invoice_line_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_line_item_templates_updated_at ON line_item_templates;
CREATE TRIGGER update_line_item_templates_updated_at
    BEFORE UPDATE ON line_item_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    invoice_number TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM 'INVOICE № (\d+)') AS INTEGER)), 0) + 1
    INTO next_number
    FROM invoices;

    invoice_number := 'INVOICE № ' || next_number;
    RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_template_usage(template_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE line_item_templates
    SET
        usage_count = usage_count + 1,
        last_used_at = NOW()
    WHERE id = template_uuid;
END;
$$ LANGUAGE plpgsql;

INSERT INTO user_settings (default_currency, date_format, pdf_color_palette)
SELECT 'eur', 'dd/mm/yyyy', 'violet'
WHERE NOT EXISTS (SELECT 1 FROM user_settings LIMIT 1);
