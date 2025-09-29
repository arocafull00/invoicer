# Instrucciones para Actualizar la Base de Datos - Plantillas de Conceptos

## 📋 Resumen
Se ha implementado un sistema de plantillas de conceptos reutilizables que permite autocompletar y seleccionar conceptos previamente utilizados, similar al funcionamiento de consultores y clientes.

## 🚀 Pasos para Actualizar

### 1. Ejecutar las Migraciones SQL

Ejecuta ambos archivos de migración en tu base de datos de Supabase:

```bash
# Primero la migración de conceptos múltiples (si no la has ejecutado)
migrations/010_create_invoice_line_items.sql

# Luego la migración de plantillas
migrations/011_create_line_item_templates.sql
```

### 2. Verificar las Migraciones

Las migraciones crearán:

**Tabla `invoice_line_items` (si no existe):**
- ✅ Soporte para múltiples conceptos por factura
- ✅ Migración automática de facturas existentes

**Tabla `line_item_templates`:**
- ✅ Plantillas reutilizables de conceptos
- ✅ Estadísticas de uso (usage_count, last_used_at)
- ✅ Categorización opcional
- ✅ Plantillas predeterminadas para nuevos usuarios
- ✅ Migración automática desde conceptos existentes

### 3. Verificar los Datos

Después de ejecutar las migraciones:

```sql
-- Verificar plantillas creadas
SELECT * FROM line_item_templates ORDER BY usage_count DESC LIMIT 10;

-- Verificar plantillas por categoría
SELECT category, COUNT(*) as count 
FROM line_item_templates 
GROUP BY category;

-- Verificar que las funciones se crearon correctamente
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN (
    'update_template_usage',
    'create_templates_from_existing_line_items',
    'create_default_templates_for_user'
);
```

## 🎯 Nuevas Características

### 🔍 Autocompletado Inteligente
- **Búsqueda en tiempo real** de plantillas existentes
- **Sugerencias basadas en uso** (las más utilizadas primero)
- **Categorización** automática de conceptos
- **Creación rápida** de nuevas plantillas

### 📊 Estadísticas de Uso
- **Contador de usos** para cada plantilla
- **Última vez utilizada** para ordenamiento
- **Plantillas más populares** destacadas
- **Aprendizaje automático** de patrones de uso

### 🎨 Interfaz Mejorada
- **Dropdown inteligente** con búsqueda
- **Vista de plantillas más usadas**
- **Creación instantánea** de plantillas
- **Categorías visuales** con badges

## 🗃️ Estructura de Datos

### Tabla `line_item_templates`
```sql
- id (UUID, PK)
- description (TEXT) - Descripción del concepto
- default_quantity (INTEGER) - Cantidad predeterminada
- default_rate (DECIMAL) - Tarifa predeterminada
- category (TEXT, opcional) - Categoría del concepto
- usage_count (INTEGER) - Número de veces utilizada
- last_used_at (TIMESTAMP) - Última vez utilizada
- user_id (UUID, FK) - Propietario de la plantilla
- created_at, updated_at (TIMESTAMPS)
```

### Plantillas Predeterminadas
Cada usuario nuevo recibirá automáticamente estas plantillas:
- 💻 **Desarrollo web** - €50.00
- 🎯 **Consultoría técnica** - €75.00
- 🎨 **Diseño gráfico** - €40.00
- 📊 **Análisis de sistemas** - €60.00
- 📚 **Formación técnica** - €45.00
- 🛠️ **Soporte técnico** - €35.00
- 📋 **Gestión de proyecto** - €55.00
- 🔍 **Auditoría de código** - €65.00

## 🔧 Funcionalidades de la API

### Métodos Disponibles
```typescript
// Cargar plantillas del usuario
getLineItemTemplates(): Promise<LineItemTemplate[]>

// Crear nueva plantilla
createLineItemTemplate(template): Promise<LineItemTemplate>

// Actualizar plantilla existente
updateLineItemTemplate(id, updates): Promise<LineItemTemplate>

// Eliminar plantilla
deleteLineItemTemplate(id): Promise<void>

// Actualizar estadísticas de uso
updateTemplateUsage(id): Promise<void>

// Crear plantillas predeterminadas
createDefaultTemplatesForUser(): Promise<void>
```

### Hook Personalizado
```typescript
const {
  templates,
  loadTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  useTemplate,
  searchTemplates,
  getTemplatesByCategory,
  getMostUsedTemplates
} = useLineItemTemplates();
```

## 💡 Cómo Usar las Plantillas

### Para Usuarios
1. **Escribir concepto**: Al escribir en el campo de descripción, aparecerán sugerencias automáticas
2. **Seleccionar plantilla**: Click en cualquier plantilla para autocompletar cantidad y tarifa
3. **Crear nuevas**: Las plantillas se crean automáticamente al usar conceptos repetidamente
4. **Búsqueda rápida**: Busca por descripción o categoría

### Comportamiento Inteligente
- 🎯 **Plantillas más usadas** aparecen primero
- 📈 **Aprendizaje automático** de patrones de uso
- 🔄 **Actualización automática** de estadísticas
- 💾 **Guardado inteligente** de nuevos conceptos

## 🛡️ Seguridad y Rendimiento

### Seguridad (RLS)
- ✅ **Row Level Security** habilitado
- ✅ **Políticas de acceso** por usuario
- ✅ **Aislamiento completo** entre usuarios

### Rendimiento
- ✅ **Índices optimizados** para búsquedas rápidas
- ✅ **Consultas eficientes** con ordenamiento por uso
- ✅ **Carga bajo demanda** de plantillas

## 🔄 Migración Automática

El sistema migrará automáticamente:
1. **Conceptos existentes** → plantillas (si se usan 2+ veces)
2. **Estadísticas de uso** desde conceptos históricos
3. **Plantillas predeterminadas** para usuarios sin plantillas

## ⚠️ Notas Importantes

1. **Compatibilidad**: El sistema es 100% compatible hacia atrás
2. **Migración segura**: Los datos existentes se preservan completamente
3. **Rendimiento**: Las consultas están optimizadas para respuesta rápida
4. **Escalabilidad**: El sistema puede manejar miles de plantillas por usuario

¡Las plantillas de conceptos harán que crear facturas sea mucho más rápido y eficiente! 🎉
