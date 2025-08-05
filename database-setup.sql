-- =====================================================
-- SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS - INVOICER
-- =====================================================

-- Habilitar la extensión UUID si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA DE CONSULTORES
-- =====================================================
CREATE TABLE IF NOT EXISTS consultants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    nif TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE CLIENTES
-- =====================================================
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    company_number TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE INSTRUCCIONES DE PAGO
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_instructions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    account_holder TEXT NOT NULL,
    iban TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    payment_terms TEXT NOT NULL,
    vat_exemption_text TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE FACTURAS
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
-- ÍNDICES PARA OPTIMIZAR CONSULTAS
-- =====================================================

-- Índices para consultants
CREATE INDEX IF NOT EXISTS idx_consultants_email ON consultants(email);
CREATE INDEX IF NOT EXISTS idx_consultants_name ON consultants(name);

-- Índices para clients
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);

-- Índices para invoices
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_created_date ON invoices(created_date);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(number);
CREATE INDEX IF NOT EXISTS idx_invoices_consultant_id ON invoices(consultant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);

-- =====================================================
-- FUNCIONES PARA ACTUALIZAR TIMESTAMPS
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
CREATE TRIGGER update_consultants_updated_at 
    BEFORE UPDATE ON consultants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_instructions_updated_at 
    BEFORE UPDATE ON payment_instructions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at 
    BEFORE UPDATE ON invoices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- POLÍTICAS DE SEGURIDAD RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE consultants ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Política para consultants (cada usuario ve solo sus consultores)
CREATE POLICY "Users can view their own consultants" ON consultants
    FOR ALL USING (auth.uid() = user_id);

-- Política para clients (cada usuario ve solo sus clientes)
CREATE POLICY "Users can view their own clients" ON clients
    FOR ALL USING (auth.uid() = user_id);

-- Política para payment_instructions (cada usuario ve solo sus instrucciones)
CREATE POLICY "Users can view their own payment instructions" ON payment_instructions
    FOR ALL USING (auth.uid() = user_id);

-- Política para invoices (cada usuario ve solo sus facturas)
CREATE POLICY "Users can view their own invoices" ON invoices
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- =====================================================

-- NOTA: Los datos de ejemplo se insertan sin user_id porque se requiere
-- un usuario autenticado. Estos se pueden insertar desde la aplicación
-- después del login, o manualmente especificando un user_id válido.

-- Ejemplo de cómo insertar datos con user_id específico:
-- INSERT INTO consultants (name, email, address, city, country, nif, user_id) VALUES
-- ('Adrián Rocafull Berbel', 'adrianrocafull1@gmail.com', 'Avenida Rey Juan Carlos I, 12, 16', 'Torrent, Valencia', 'Spain', '53882287A', 'tu-user-id-aqui')
-- ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- FUNCIÓN PARA GENERAR NÚMEROS DE FACTURA
-- =====================================================

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    invoice_number TEXT;
BEGIN
    -- Obtener el siguiente número de factura
    SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM 'INVOICE № (\d+)') AS INTEGER)), 0) + 1
    INTO next_number
    FROM invoices;
    
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
    RAISE NOTICE '✅ Base de datos inicializada correctamente!';
    RAISE NOTICE '📊 Tablas creadas: consultants, clients, payment_instructions, invoices';
    RAISE NOTICE '🔒 RLS habilitado en todas las tablas';
    RAISE NOTICE '📈 Índices creados para optimizar consultas';
    RAISE NOTICE '🔄 Triggers configurados para updated_at';
    RAISE NOTICE '📝 Datos de ejemplo insertados';
END $$; 