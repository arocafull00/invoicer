CREATE TABLE IF NOT EXISTS expense_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT expense_types_user_id_name_key UNIQUE (user_id, name)
);

CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    invoice_number TEXT NOT NULL DEFAULT '',
    provider TEXT NOT NULL,
    concept TEXT NOT NULL,
    base_amount DECIMAL(10,2) NOT NULL,
    vat_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    expense_type_id UUID REFERENCES expense_types(id) ON DELETE SET NULL,
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expense_types_user_id ON expense_types(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_types_name ON expense_types(name);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_type_id ON expenses(expense_type_id);

DROP TRIGGER IF EXISTS update_expense_types_updated_at ON expense_types;
CREATE TRIGGER update_expense_types_updated_at
    BEFORE UPDATE ON expense_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
