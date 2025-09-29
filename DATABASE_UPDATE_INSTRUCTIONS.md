# Instrucciones para Actualizar la Base de Datos

## 📋 Resumen
Se ha implementado soporte para múltiples conceptos (line items) en las facturas. Esto requiere actualizar la base de datos para crear la nueva tabla `invoice_line_items` y migrar los datos existentes.

## 🚀 Pasos para Actualizar

### 1. Ejecutar la Migración SQL

Ejecuta el archivo de migración en tu base de datos de Supabase:

```bash
# En tu panel de Supabase, ve a SQL Editor y ejecuta:
migrations/010_create_invoice_line_items.sql
```

O si tienes acceso directo a PostgreSQL:

```bash
psql -h [tu-host] -U [tu-usuario] -d [tu-base-de-datos] -f migrations/010_create_invoice_line_items.sql
```

### 2. Verificar la Migración

La migración creará:

- ✅ Tabla `invoice_line_items` con todos los campos necesarios
- ✅ Índices para optimizar las consultas
- ✅ Políticas RLS (Row Level Security)
- ✅ Triggers para `updated_at`
- ✅ Migración automática de facturas existentes

### 3. Verificar los Datos

Después de ejecutar la migración, puedes verificar que todo funciona correctamente:

```sql
-- Verificar que la tabla se creó correctamente
SELECT * FROM invoice_line_items LIMIT 5;

-- Verificar que las facturas existentes se migraron
SELECT 
    i.number,
    i.description as original_description,
    ili.description as line_item_description,
    ili.quantity,
    ili.rate,
    ili.total
FROM invoices i
JOIN invoice_line_items ili ON i.id = ili.invoice_id
LIMIT 5;

-- Contar facturas migradas
SELECT COUNT(*) as migrated_invoices 
FROM invoices i
JOIN invoice_line_items ili ON i.id = ili.invoice_id;
```

## 🔧 Cambios Realizados

### Base de Datos
- ➕ Nueva tabla `invoice_line_items`
- ➕ Campos: `id`, `invoice_id`, `description`, `quantity`, `rate`, `total`, `order_index`
- ➕ Relaciones: FK a `invoices` y `users`
- ➕ RLS habilitado para seguridad
- ➕ Migración automática de datos existentes

### API
- 🔄 Actualizado `getInvoices()` para incluir line_items
- 🔄 Actualizado `createInvoice()` para manejar múltiples conceptos
- 🔄 Actualizado `updateInvoice()` para manejar múltiples conceptos
- 🔄 Actualizado `softDeleteInvoice()` para incluir line_items

### Frontend
- 🎨 Nueva UI para agregar/editar/eliminar múltiples conceptos
- 📊 Cálculo automático de totales
- 📄 PDF y CSV actualizados para mostrar múltiples conceptos
- 🔄 Compatibilidad hacia atrás con facturas existentes

## ⚠️ Importante

1. **Backup**: Asegúrate de hacer un backup de tu base de datos antes de ejecutar la migración.

2. **Compatibilidad**: El sistema mantiene compatibilidad hacia atrás. Las facturas existentes seguirán funcionando.

3. **Migración Automática**: La migración convertirá automáticamente las facturas existentes con `description` única a un concepto en `invoice_line_items`.

4. **Verificación**: Después de la migración, verifica que todas las facturas existentes aparezcan correctamente en la aplicación.

## 🐛 Solución de Problemas

### Error: "relation invoice_line_items does not exist"
- Asegúrate de haber ejecutado la migración `010_create_invoice_line_items.sql`

### Facturas sin conceptos
- La migración debería haber creado automáticamente conceptos para facturas existentes
- Si algunas facturas no tienen conceptos, puedes ejecutar manualmente:

```sql
SELECT migrate_existing_invoices_to_line_items();
```

### Problemas de permisos
- Verifica que RLS esté habilitado y las políticas creadas correctamente
- Los usuarios solo deberían ver sus propios conceptos

## 📞 Soporte

Si encuentras algún problema durante la actualización:

1. Verifica los logs de la base de datos
2. Asegúrate de que todos los archivos de migración se ejecutaron correctamente
3. Verifica que no hay errores de TypeScript en el frontend
4. Comprueba que las consultas SQL funcionan correctamente

La migración está diseñada para ser segura y mantener todos los datos existentes intactos.
