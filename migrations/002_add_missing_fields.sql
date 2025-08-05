-- Migration: 002_add_missing_fields.sql
-- Description: Add missing fields to existing tables
-- Created: 2024-08-05

-- =====================================================
-- AÑADIR CAMPOS FALTANTES A CONSULTANTS
-- =====================================================

-- Añadir campos que faltan a la tabla consultants
ALTER TABLE consultants 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS nif TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Hacer los campos obligatorios si no existen
DO $$
BEGIN
    -- Hacer name obligatorio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'consultants' AND column_name = 'name' AND is_nullable = 'NO') THEN
        ALTER TABLE consultants ALTER COLUMN name SET NOT NULL;
    END IF;
    
    -- Hacer email obligatorio y único
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'consultants' AND column_name = 'email' AND is_nullable = 'NO') THEN
        ALTER TABLE consultants ALTER COLUMN email SET NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'consultants' AND constraint_name LIKE '%email%' AND constraint_type = 'UNIQUE') THEN
        ALTER TABLE consultants ADD CONSTRAINT consultants_email_unique UNIQUE (email);
    END IF;
    
    -- Hacer address obligatorio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'consultants' AND column_name = 'address' AND is_nullable = 'NO') THEN
        ALTER TABLE consultants ALTER COLUMN address SET NOT NULL;
    END IF;
    
    -- Hacer city obligatorio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'consultants' AND column_name = 'city' AND is_nullable = 'NO') THEN
        ALTER TABLE consultants ALTER COLUMN city SET NOT NULL;
    END IF;
    
    -- Hacer country obligatorio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'consultants' AND column_name = 'country' AND is_nullable = 'NO') THEN
        ALTER TABLE consultants ALTER COLUMN country SET NOT NULL;
    END IF;
    
    -- Hacer nif obligatorio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'consultants' AND column_name = 'nif' AND is_nullable = 'NO') THEN
        ALTER TABLE consultants ALTER COLUMN nif SET NOT NULL;
    END IF;
END $$;

-- =====================================================
-- AÑADIR CAMPOS FALTANTES A CLIENTS
-- =====================================================

-- Añadir campos que faltan a la tabla clients
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS company_number TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Hacer los campos obligatorios si no existen
DO $$
BEGIN
    -- Hacer name obligatorio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'name' AND is_nullable = 'NO') THEN
        ALTER TABLE clients ALTER COLUMN name SET NOT NULL;
    END IF;
    
    -- Hacer email obligatorio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'email' AND is_nullable = 'NO') THEN
        ALTER TABLE clients ALTER COLUMN email SET NOT NULL;
    END IF;
    
    -- Hacer address obligatorio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'address' AND is_nullable = 'NO') THEN
        ALTER TABLE clients ALTER COLUMN address SET NOT NULL;
    END IF;
    
    -- Hacer city obligatorio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'city' AND is_nullable = 'NO') THEN
        ALTER TABLE clients ALTER COLUMN city SET NOT NULL;
    END IF;
    
    -- Hacer country obligatorio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'country' AND is_nullable = 'NO') THEN
        ALTER TABLE clients ALTER COLUMN country SET NOT NULL;
    END IF;
END $$;

-- =====================================================
-- AÑADIR CAMPOS FALTANTES A PAYMENT_INSTRUCTIONS
-- =====================================================

-- Añadir campos que faltan a la tabla payment_instructions
ALTER TABLE payment_instructions 
ADD COLUMN IF NOT EXISTS account_holder TEXT,
ADD COLUMN IF NOT EXISTS iban TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS payment_terms TEXT,
ADD COLUMN IF NOT EXISTS vat_exemption_text TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Hacer los campos obligatorios si no existen
DO $$
BEGIN
    -- Hacer account_holder obligatorio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payment_instructions' AND column_name = 'account_holder' AND is_nullable = 'NO') THEN
        ALTER TABLE payment_instructions ALTER COLUMN account_holder SET NOT NULL;
    END IF;
    
    -- Hacer iban obligatorio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payment_instructions' AND column_name = 'iban' AND is_nullable = 'NO') THEN
        ALTER TABLE payment_instructions ALTER COLUMN iban SET NOT NULL;
    END IF;
    
    -- Hacer payment_method obligatorio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payment_instructions' AND column_name = 'payment_method' AND is_nullable = 'NO') THEN
        ALTER TABLE payment_instructions ALTER COLUMN payment_method SET NOT NULL;
    END IF;
    
    -- Hacer payment_terms obligatorio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payment_instructions' AND column_name = 'payment_terms' AND is_nullable = 'NO') THEN
        ALTER TABLE payment_instructions ALTER COLUMN payment_terms SET NOT NULL;
    END IF;
    
    -- Hacer vat_exemption_text obligatorio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payment_instructions' AND column_name = 'vat_exemption_text' AND is_nullable = 'NO') THEN
        ALTER TABLE payment_instructions ALTER COLUMN vat_exemption_text SET NOT NULL;
    END IF;
END $$;

-- =====================================================
-- AÑADIR CAMPOS FALTANTES A INVOICES
-- =====================================================

-- Añadir campos que faltan a la tabla invoices
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS number TEXT,
ADD COLUMN IF NOT EXISTS created_date DATE,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS consultant_id UUID REFERENCES consultants(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS payment_instructions_id UUID REFERENCES payment_instructions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS total DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS vat_exempt BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Hacer los campos obligatorios si no existen
DO $$
BEGIN
    -- Hacer number obligatorio y único
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoices' AND column_name = 'number' AND is_nullable = 'NO') THEN
        ALTER TABLE invoices ALTER COLUMN number SET NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'invoices' AND constraint_name LIKE '%number%' AND constraint_type = 'UNIQUE') THEN
        ALTER TABLE invoices ADD CONSTRAINT invoices_number_unique UNIQUE (number);
    END IF;
    
    -- Hacer created_date obligatorio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoices' AND column_name = 'created_date' AND is_nullable = 'NO') THEN
        ALTER TABLE invoices ALTER COLUMN created_date SET NOT NULL;
    END IF;
    
    -- Hacer start_date obligatorio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoices' AND column_name = 'start_date' AND is_nullable = 'NO') THEN
        ALTER TABLE invoices ALTER COLUMN start_date SET NOT NULL;
    END IF;
    
    -- Hacer end_date obligatorio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoices' AND column_name = 'end_date' AND is_nullable = 'NO') THEN
        ALTER TABLE invoices ALTER COLUMN end_date SET NOT NULL;
    END IF;
    
    -- Hacer description obligatorio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoices' AND column_name = 'description' AND is_nullable = 'NO') THEN
        ALTER TABLE invoices ALTER COLUMN description SET NOT NULL;
    END IF;
    
    -- Hacer total obligatorio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoices' AND column_name = 'total' AND is_nullable = 'NO') THEN
        ALTER TABLE invoices ALTER COLUMN total SET NOT NULL;
    END IF;
END $$;

-- =====================================================
-- CREAR ÍNDICES FALTANTES
-- =====================================================

-- Índices para consultants
CREATE INDEX IF NOT EXISTS idx_consultants_user_id ON consultants(user_id);
CREATE INDEX IF NOT EXISTS idx_consultants_email ON consultants(email);
CREATE INDEX IF NOT EXISTS idx_consultants_name ON consultants(name);

-- Índices para clients
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);

-- Índices para payment_instructions
CREATE INDEX IF NOT EXISTS idx_payment_instructions_user_id ON payment_instructions(user_id);

-- Índices para invoices
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_created_date ON invoices(created_date);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(number);
CREATE INDEX IF NOT EXISTS idx_invoices_consultant_id ON invoices(consultant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);

-- =====================================================
-- CREAR TRIGGERS FALTANTES
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
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

-- =====================================================
-- HABILITAR RLS Y CREAR POLÍTICAS
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE consultants ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can view their own consultants" ON consultants;
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
DROP POLICY IF EXISTS "Users can view their own payment instructions" ON payment_instructions;
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;

-- Crear nuevas políticas
CREATE POLICY "Users can view their own consultants" ON consultants
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own clients" ON clients
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own payment instructions" ON payment_instructions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own invoices" ON invoices
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- FUNCIÓN PARA GENERAR NÚMEROS DE FACTURA
-- =====================================================

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    invoice_number TEXT;
BEGIN
    -- Obtener el siguiente número de factura para el usuario actual
    SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM 'INVOICE № (\d+)') AS INTEGER)), 0) + 1
    INTO next_number
    FROM invoices
    WHERE user_id = auth.uid();
    
    -- Formatear el número de factura
    invoice_number := 'INVOICE № ' || next_number;
    
    RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Campos faltantes añadidos correctamente!';
    RAISE NOTICE '📊 Tablas actualizadas: consultants, clients, payment_instructions, invoices';
    RAISE NOTICE '🔒 RLS habilitado y políticas creadas';
    RAISE NOTICE '📈 Índices creados para optimizar consultas';
    RAISE NOTICE '🔄 Triggers configurados para updated_at';
    RAISE NOTICE '📝 Función generate_invoice_number() creada';
END $$; 