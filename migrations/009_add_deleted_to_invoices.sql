-- Migration: 009_add_deleted_to_invoices.sql
-- Description: Add soft delete column to invoices

ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_invoices_deleted ON invoices(deleted);


