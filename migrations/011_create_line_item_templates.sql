-- Migration: 011_create_line_item_templates.sql
-- Description: Create line_item_templates table for reusable line item templates
-- Created: 2024-12-29

-- =====================================================
-- CREAR TABLA DE PLANTILLAS DE CONCEPTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS line_item_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    description TEXT NOT NULL,
    default_quantity INTEGER NOT NULL DEFAULT 1 CHECK (default_quantity > 0),
    default_rate DECIMAL(10,2) NOT NULL CHECK (default_rate >= 0),
    category TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, description)
);

-- =====================================================
-- CREAR ÍNDICES PARA LINE_ITEM_TEMPLATES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_line_item_templates_user_id ON line_item_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_line_item_templates_description ON line_item_templates(description);
CREATE INDEX IF NOT EXISTS idx_line_item_templates_category ON line_item_templates(category);
CREATE INDEX IF NOT EXISTS idx_line_item_templates_usage ON line_item_templates(user_id, usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_line_item_templates_last_used ON line_item_templates(user_id, last_used_at DESC);

-- =====================================================
-- CREAR TRIGGER PARA UPDATED_AT
-- =====================================================

-- Trigger para actualizar updated_at en line_item_templates
DROP TRIGGER IF EXISTS update_line_item_templates_updated_at ON line_item_templates;
CREATE TRIGGER update_line_item_templates_updated_at 
    BEFORE UPDATE ON line_item_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HABILITAR RLS Y CREAR POLÍTICAS
-- =====================================================

-- Habilitar RLS en line_item_templates
ALTER TABLE line_item_templates ENABLE ROW LEVEL SECURITY;

-- Crear política para line_item_templates
CREATE POLICY "Users can manage their own line item templates" ON line_item_templates
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- FUNCIÓN PARA ACTUALIZAR ESTADÍSTICAS DE USO
-- =====================================================

CREATE OR REPLACE FUNCTION update_template_usage(template_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE line_item_templates 
    SET 
        usage_count = usage_count + 1,
        last_used_at = NOW()
    WHERE id = template_uuid;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIÓN PARA CREAR PLANTILLAS DESDE CONCEPTOS EXISTENTES
-- =====================================================

CREATE OR REPLACE FUNCTION create_templates_from_existing_line_items()
RETURNS INTEGER AS $$
DECLARE
    item_record RECORD;
    template_count INTEGER := 0;
BEGIN
    -- Crear plantillas únicas basadas en conceptos existentes
    FOR item_record IN 
        SELECT DISTINCT
            description,
            user_id,
            AVG(quantity)::INTEGER as avg_quantity,
            AVG(rate) as avg_rate,
            COUNT(*) as usage_count,
            MAX(created_at) as last_used_at
        FROM invoice_line_items
        WHERE description IS NOT NULL AND description != ''
        GROUP BY description, user_id
        HAVING COUNT(*) >= 2  -- Solo crear plantillas para conceptos usados al menos 2 veces
    LOOP
        -- Insertar plantilla si no existe
        INSERT INTO line_item_templates (
            description,
            default_quantity,
            default_rate,
            user_id,
            usage_count,
            last_used_at
        ) VALUES (
            item_record.description,
            GREATEST(item_record.avg_quantity, 1),
            item_record.avg_rate,
            item_record.user_id,
            item_record.usage_count,
            item_record.last_used_at
        )
        ON CONFLICT (user_id, description) DO NOTHING;
        
        template_count := template_count + 1;
    END LOOP;
    
    RETURN template_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INSERTAR PLANTILLAS COMUNES PREDETERMINADAS
-- =====================================================

-- Esta función se ejecutará para cada usuario cuando cree su primera factura
CREATE OR REPLACE FUNCTION create_default_templates_for_user(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO line_item_templates (description, default_quantity, default_rate, category, user_id) VALUES
    ('Desarrollo web', 1, 50.00, 'Desarrollo', user_uuid),
    ('Consultoría técnica', 1, 75.00, 'Consultoría', user_uuid),
    ('Diseño gráfico', 1, 40.00, 'Diseño', user_uuid),
    ('Análisis de sistemas', 1, 60.00, 'Análisis', user_uuid),
    ('Formación técnica', 1, 45.00, 'Formación', user_uuid),
    ('Soporte técnico', 1, 35.00, 'Soporte', user_uuid),
    ('Gestión de proyecto', 1, 55.00, 'Gestión', user_uuid),
    ('Auditoría de código', 1, 65.00, 'Auditoría', user_uuid)
    ON CONFLICT (user_id, description) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- EJECUTAR CREACIÓN DE PLANTILLAS DESDE DATOS EXISTENTES
-- =====================================================

DO $$
DECLARE
    template_count INTEGER;
BEGIN
    -- Crear plantillas desde conceptos existentes
    SELECT create_templates_from_existing_line_items() INTO template_count;
    
    RAISE NOTICE '✅ Tabla line_item_templates creada correctamente!';
    RAISE NOTICE '📊 Tabla: line_item_templates para plantillas reutilizables';
    RAISE NOTICE '🔒 RLS habilitado y política creada';
    RAISE NOTICE '📈 Índices creados para optimizar consultas';
    RAISE NOTICE '🔄 Trigger configurado para updated_at';
    RAISE NOTICE '📝 Funciones de utilidad creadas';
    RAISE NOTICE '🎯 % plantillas creadas desde conceptos existentes', template_count;
    RAISE NOTICE '💡 Plantillas predeterminadas disponibles para nuevos usuarios';
END $$;
