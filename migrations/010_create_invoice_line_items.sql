-- Migration: 010_create_invoice_line_items.sql
-- Description: Create invoice_line_items table to support multiple line items per invoice
-- Created: 2024-12-29

-- =====================================================
-- CREAR TABLA DE CONCEPTOS DE FACTURA
-- =====================================================
CREATE TABLE IF NOT EXISTS invoice_line_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    rate DECIMAL(10,2) NOT NULL CHECK (rate >= 0),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    order_index INTEGER NOT NULL DEFAULT 0,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREAR ÍNDICES PARA INVOICE_LINE_ITEMS
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_user_id ON invoice_line_items(user_id);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_order ON invoice_line_items(invoice_id, order_index);

-- =====================================================
-- CREAR TRIGGER PARA UPDATED_AT
-- =====================================================

-- Trigger para actualizar updated_at en invoice_line_items
DROP TRIGGER IF EXISTS update_invoice_line_items_updated_at ON invoice_line_items;
CREATE TRIGGER update_invoice_line_items_updated_at 
    BEFORE UPDATE ON invoice_line_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HABILITAR RLS Y CREAR POLÍTICAS
-- =====================================================

-- Habilitar RLS en invoice_line_items
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;

-- Crear política para invoice_line_items
CREATE POLICY "Users can manage their own invoice line items" ON invoice_line_items
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- FUNCIÓN PARA CALCULAR TOTAL DE FACTURA
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_invoice_total(invoice_uuid UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    line_items_total DECIMAL(10,2);
    invoice_total DECIMAL(10,2);
BEGIN
    -- Calcular total de conceptos
    SELECT COALESCE(SUM(total), 0)
    INTO line_items_total
    FROM invoice_line_items
    WHERE invoice_id = invoice_uuid;
    
    -- Si hay conceptos, usar ese total; si no, usar el total original de la factura
    IF line_items_total > 0 THEN
        invoice_total := line_items_total;
    ELSE
        SELECT total INTO invoice_total
        FROM invoices
        WHERE id = invoice_uuid;
    END IF;
    
    RETURN COALESCE(invoice_total, 0);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIÓN PARA MIGRAR FACTURAS EXISTENTES
-- =====================================================

CREATE OR REPLACE FUNCTION migrate_existing_invoices_to_line_items()
RETURNS INTEGER AS $$
DECLARE
    invoice_record RECORD;
    migrated_count INTEGER := 0;
BEGIN
    -- Migrar facturas existentes que no tienen conceptos
    FOR invoice_record IN 
        SELECT i.id, i.description, i.total, i.user_id
        FROM invoices i
        LEFT JOIN invoice_line_items ili ON i.id = ili.invoice_id
        WHERE ili.id IS NULL AND i.description IS NOT NULL AND i.description != ''
    LOOP
        -- Crear un concepto único basado en la descripción existente
        INSERT INTO invoice_line_items (
            invoice_id,
            description,
            quantity,
            rate,
            total,
            order_index,
            user_id
        ) VALUES (
            invoice_record.id,
            invoice_record.description,
            1,
            invoice_record.total,
            invoice_record.total,
            0,
            invoice_record.user_id
        );
        
        migrated_count := migrated_count + 1;
    END LOOP;
    
    RETURN migrated_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- EJECUTAR MIGRACIÓN DE DATOS EXISTENTES
-- =====================================================

DO $$
DECLARE
    migrated_count INTEGER;
BEGIN
    -- Ejecutar migración
    SELECT migrate_existing_invoices_to_line_items() INTO migrated_count;
    
    RAISE NOTICE '✅ Tabla invoice_line_items creada correctamente!';
    RAISE NOTICE '📊 Tabla: invoice_line_items con soporte para múltiples conceptos';
    RAISE NOTICE '🔒 RLS habilitado y política creada';
    RAISE NOTICE '📈 Índices creados para optimizar consultas';
    RAISE NOTICE '🔄 Trigger configurado para updated_at';
    RAISE NOTICE '📝 Función calculate_invoice_total() creada';
    RAISE NOTICE '🔄 % facturas migradas a conceptos', migrated_count;
END $$;
