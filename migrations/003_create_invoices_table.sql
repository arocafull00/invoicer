-- Migration: 003_create_invoices_table.sql
-- Description: Create invoices table and dependencies
-- Created: 2024-08-05

-- =====================================================
-- HABILITAR EXTENSIÓN UUID SI NO EXISTE
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CREAR TABLA DE FACTURAS
-- =====================================================
CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    number TEXT NOT NULL UNIQUE,
    created_date DATE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    consultant_id UUID REFERENCES consultants(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    payment_instructions_id UUID REFERENCES payment_instructions(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    vat_exempt BOOLEAN DEFAULT true,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREAR ÍNDICES PARA INVOICES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_created_date ON invoices(created_date);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(number);
CREATE INDEX IF NOT EXISTS idx_invoices_consultant_id ON invoices(consultant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);

-- =====================================================
-- CREAR TRIGGER PARA UPDATED_AT
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en invoices
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at 
    BEFORE UPDATE ON invoices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HABILITAR RLS Y CREAR POLÍTICAS
-- =====================================================

-- Habilitar RLS en invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Eliminar política existente si la hay
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;

-- Crear política para invoices
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
    RAISE NOTICE '✅ Tabla invoices creada correctamente!';
    RAISE NOTICE '📊 Tabla: invoices con todos sus campos';
    RAISE NOTICE '🔒 RLS habilitado y política creada';
    RAISE NOTICE '📈 Índices creados para optimizar consultas';
    RAISE NOTICE '🔄 Trigger configurado para updated_at';
    RAISE NOTICE '📝 Función generate_invoice_number() creada';
END $$; 