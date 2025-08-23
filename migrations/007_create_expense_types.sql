-- =====================================================
-- TABLA DE TIPOS DE GASTO
-- =====================================================

CREATE TABLE IF NOT EXISTS expense_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_expense_types_user_id ON expense_types(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_types_name ON expense_types(name);

-- Trigger updated_at
CREATE TRIGGER update_expense_types_updated_at 
    BEFORE UPDATE ON expense_types 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE expense_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own expense_types" ON expense_types
    FOR ALL USING (auth.uid() = user_id);


