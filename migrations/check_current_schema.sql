-- Script: check_current_schema.sql
-- Description: Verificar el estado actual del esquema de la base de datos

-- Verificar tablas existentes
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar si existe la tabla invoices
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices'
) as invoices_table_exists; 