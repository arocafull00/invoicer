-- Migration: 013_add_include_vat_to_line_items.sql
-- Description: Add include_vat column to invoice_line_items table to support per-item VAT application
-- Created: 2024-12-29

-- =====================================================
-- ADD INCLUDE_VAT COLUMN TO INVOICE_LINE_ITEMS
-- =====================================================

-- Add include_vat column (defaults to false, meaning no VAT by default)
ALTER TABLE invoice_line_items 
ADD COLUMN IF NOT EXISTS include_vat BOOLEAN DEFAULT false NOT NULL;

-- =====================================================
-- UPDATE EXISTING RECORDS
-- =====================================================

-- For existing records, set include_vat based on the parent invoice's vat_exempt field
-- If the invoice is NOT vat_exempt, then the line items should have VAT applied
UPDATE invoice_line_items ili
SET include_vat = NOT i.vat_exempt
FROM invoices i
WHERE ili.invoice_id = i.id
  AND ili.include_vat = false; -- Only update records that haven't been explicitly set

-- =====================================================
-- NOTIFICATION
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Columna include_vat añadida correctamente a invoice_line_items!';
    RAISE NOTICE '📊 Los conceptos ahora soportan IVA individual';
    RAISE NOTICE '🔄 Registros existentes actualizados basándose en el campo vat_exempt de las facturas';
END $$;

