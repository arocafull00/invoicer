-- Migration: 012_add_vat_fields_to_invoices.sql
-- Description: Add VAT breakdown fields to invoices table
-- Created: 2024-12-29

-- =====================================================
-- AGREGAR CAMPOS DE IVA A LA TABLA INVOICES
-- =====================================================

-- Agregar nuevos campos para el desglose de IVA
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS vat_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS vat_amount DECIMAL(10,2) DEFAULT 0;

-- =====================================================
-- MIGRAR DATOS EXISTENTES
-- =====================================================

-- Función para migrar facturas existentes al nuevo formato
CREATE OR REPLACE FUNCTION migrate_invoices_vat_fields()
RETURNS INTEGER AS $$
DECLARE
    invoice_record RECORD;
    migrated_count INTEGER := 0;
BEGIN
    -- Migrar facturas que no tienen subtotal definido
    FOR invoice_record IN 
        SELECT id, total, vat_exempt
        FROM invoices 
        WHERE subtotal IS NULL
    LOOP
        -- Si la factura está exenta de IVA, subtotal = total
        IF invoice_record.vat_exempt THEN
            UPDATE invoices 
            SET 
                subtotal = invoice_record.total,
                vat_rate = 0,
                vat_amount = 0
            WHERE id = invoice_record.id;
        ELSE
            -- Si no está exenta, calcular retroactivamente (asumiendo 21% IVA incluido)
            -- total = subtotal + IVA
            -- subtotal = total / 1.21
            -- vat_amount = total - subtotal
            UPDATE invoices 
            SET 
                subtotal = ROUND(invoice_record.total / 1.21, 2),
                vat_rate = 21,
                vat_amount = ROUND(invoice_record.total - (invoice_record.total / 1.21), 2)
            WHERE id = invoice_record.id;
        END IF;
        
        migrated_count := migrated_count + 1;
    END LOOP;
    
    RETURN migrated_count;
END;
$$ LANGUAGE plpgsql;

-- Ejecutar la migración
DO $$
DECLARE
    migrated_count INTEGER;
BEGIN
    SELECT migrate_invoices_vat_fields() INTO migrated_count;
    
    RAISE NOTICE '✅ Campos de IVA agregados a la tabla invoices!';
    RAISE NOTICE '📊 Nuevos campos: subtotal, vat_rate, vat_amount';
    RAISE NOTICE '🔄 % facturas migradas con campos de IVA', migrated_count;
    RAISE NOTICE '💡 Las facturas nuevas tendrán desglose completo de IVA';
END $$;

-- =====================================================
-- LIMPIAR FUNCIÓN TEMPORAL
-- =====================================================
DROP FUNCTION IF EXISTS migrate_invoices_vat_fields();
