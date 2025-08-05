# 📊 Sistema de Migraciones - Invoicer

Este directorio contiene todas las migraciones de la base de datos para el proyecto Invoicer.

## 📁 Estructura

```
migrations/
├── README.md                    # Esta documentación
├── 001_initial_schema.sql      # Esquema inicial
├── 002_add_missing_fields.sql  # Campos faltantes
└── [futuras_migraciones].sql   # Migraciones futuras
```

## 🚀 Cómo usar las migraciones

### **Ejecutar una migración específica:**

1. Ve al **Supabase Dashboard**
2. Navega a **SQL Editor**
3. Copia y pega el contenido del archivo de migración
4. Ejecuta el script

### **Ejecutar todas las migraciones en orden:**

```bash
# Ejecutar migraciones en orden numérico
cat migrations/001_initial_schema.sql | psql [tu_connection_string]
cat migrations/002_add_missing_fields.sql | psql [tu_connection_string]
```

## 📝 Crear una nueva migración

### **1. Nomenclatura:**
```
XXX_description.sql
```
- `XXX`: Número secuencial (001, 002, 003...)
- `description`: Descripción breve en inglés

### **2. Estructura del archivo:**
```sql
-- Migration: XXX_description.sql
-- Description: Descripción detallada
-- Created: YYYY-MM-DD

-- =====================================================
-- CAMBIOS ESPECÍFICOS
-- =====================================================

-- Tu código SQL aquí...

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migración XXX completada!';
    RAISE NOTICE '📊 Cambios realizados: [descripción]';
END $$;
```

## 🔧 Tipos de migraciones comunes

### **Añadir una nueva tabla:**
```sql
CREATE TABLE IF NOT EXISTS nueva_tabla (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campo1 TEXT NOT NULL,
    campo2 INTEGER,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_nueva_tabla_user_id ON nueva_tabla(user_id);

-- RLS
ALTER TABLE nueva_tabla ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own nueva_tabla" ON nueva_tabla
    FOR ALL USING (auth.uid() = user_id);

-- Trigger
CREATE TRIGGER update_nueva_tabla_updated_at 
    BEFORE UPDATE ON nueva_tabla 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **Añadir un campo a una tabla existente:**
```sql
ALTER TABLE tabla_existente 
ADD COLUMN IF NOT EXISTS nuevo_campo TEXT;

-- Hacer obligatorio si es necesario
ALTER TABLE tabla_existente ALTER COLUMN nuevo_campo SET NOT NULL;
```

### **Modificar un campo existente:**
```sql
-- Cambiar tipo de dato
ALTER TABLE tabla_existente ALTER COLUMN campo_existente TYPE NEW_TYPE;

-- Cambiar restricciones
ALTER TABLE tabla_existente ALTER COLUMN campo_existente DROP NOT NULL;
ALTER TABLE tabla_existente ALTER COLUMN campo_existente SET NOT NULL;
```

### **Eliminar un campo:**
```sql
ALTER TABLE tabla_existente DROP COLUMN IF EXISTS campo_a_eliminar;
```

## ⚠️ Buenas prácticas

### **✅ Hacer:**
- Usar `IF NOT EXISTS` y `IF EXISTS` para evitar errores
- Incluir mensajes de confirmación con `RAISE NOTICE`
- Documentar cada migración con comentarios
- Probar en desarrollo antes de producción
- Hacer backup antes de migraciones importantes

### **❌ No hacer:**
- Modificar migraciones ya ejecutadas en producción
- Ejecutar migraciones fuera de orden
- Olvidar habilitar RLS en nuevas tablas
- No crear índices para campos de búsqueda frecuente

## 🔍 Verificar el estado de las migraciones

### **Ver tablas existentes:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### **Ver campos de una tabla:**
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'nombre_tabla'
ORDER BY ordinal_position;
```

### **Ver políticas RLS:**
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## 🆘 Resolución de problemas

### **Error: "relation already exists"**
- Usa `CREATE TABLE IF NOT EXISTS` en lugar de `CREATE TABLE`

### **Error: "column already exists"**
- Usa `ADD COLUMN IF NOT EXISTS` en lugar de `ADD COLUMN`

### **Error: "policy already exists"**
- Usa `DROP POLICY IF EXISTS` antes de `CREATE POLICY`

### **Error: "trigger already exists"**
- Usa `DROP TRIGGER IF EXISTS` antes de `CREATE TRIGGER`

## 📚 Recursos adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)
- [Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) 