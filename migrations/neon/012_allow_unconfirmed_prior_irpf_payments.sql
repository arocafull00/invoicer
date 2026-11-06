DO $$
BEGIN
  LOCK TABLE tax_period_settings IN ACCESS EXCLUSIVE MODE;
  IF EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = 'tax_period_settings'::regclass
      AND attname = 'prior_irpf_payments' AND attnotnull
  ) THEN
    ALTER TABLE tax_period_settings
      ALTER COLUMN prior_irpf_payments DROP DEFAULT,
      ALTER COLUMN prior_irpf_payments DROP NOT NULL;

    -- Old zeroes were indistinguishable from the default for VAT-only settings.
    UPDATE tax_period_settings SET prior_irpf_payments = NULL WHERE prior_irpf_payments = 0;
  END IF;
END $$;
