-- Migration: 004_rename_vat_exemption_text_to_additional_data.sql
-- Description: Rename column vat_exemption_text -> additional_data in payment_instructions
-- Created: 2025-08-13

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_instructions' 
          AND column_name = 'vat_exemption_text'
    ) THEN
        ALTER TABLE payment_instructions RENAME COLUMN vat_exemption_text TO additional_data;
    END IF;
END $$;

-- Ensure NOT NULL
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_instructions' 
          AND column_name = 'additional_data'
          AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE payment_instructions ALTER COLUMN additional_data SET NOT NULL;
    END IF;
END $$;

DO $$
BEGIN
    RAISE NOTICE '✅ Renamed vat_exemption_text to additional_data in payment_instructions';
END $$;


