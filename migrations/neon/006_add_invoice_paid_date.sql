ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS paid_date DATE;

ALTER TABLE invoices
ADD CONSTRAINT invoices_paid_date_requires_paid_status
CHECK (paid_date IS NULL OR status = 'paid');
