-- =====================================================
-- TABLA DE INGRESOS EXTRA
-- =====================================================

CREATE TABLE IF NOT EXISTS incomes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    concept TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_incomes_user_id ON incomes(user_id);
CREATE INDEX IF NOT EXISTS idx_incomes_date ON incomes(date);
CREATE INDEX IF NOT EXISTS idx_incomes_client_id ON incomes(client_id);
CREATE INDEX IF NOT EXISTS idx_incomes_invoice_id ON incomes(invoice_id);

-- Trigger updated_at
CREATE TRIGGER update_incomes_updated_at 
    BEFORE UPDATE ON incomes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own incomes" ON incomes
    FOR ALL USING (auth.uid() = user_id);




