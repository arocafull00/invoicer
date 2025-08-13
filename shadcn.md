### Sustituciones a shadcn/ui

Referencia: [Listado de componentes de shadcn/ui](https://ui.shadcn.com/docs/components)

#### Núcleo (reemplazos 1:1 de componentes base)
- Button → usar `@/components/ui/button`
  - Reemplazar imports desde `@/shared/components/button`
  - Dónde: `src/dashboard/components/DashboardHeader.tsx`, `src/invoices/components/InvoiceTable.tsx`, `src/login/index.tsx`, `src/shared/components/Sidebar.tsx`, `src/invoices/Wizard/StepClient.tsx`, `src/invoices/Wizard/StepConsultant.tsx`, `src/invoices/Wizard/StepPayment.tsx`, `src/shared/components/ConfirmDialog.tsx`

- Input → usar `@/components/ui/input`
  - Reemplazar imports desde `@/shared/components/input`
  - Dónde: `src/login/index.tsx`, `src/invoices/Wizard/StepClient.tsx`, `src/invoices/Wizard/StepConsultant.tsx`, `src/invoices/Wizard/StepDetails.tsx`, `src/invoices/Wizard/StepDates.tsx`, `src/invoices/Wizard/StepPayment.tsx`

- Label → usar `@/components/ui/label`
  - Reemplazar imports desde `@/shared/components/label`
  - Dónde: `src/invoices/Wizard/StepClient.tsx`, `src/invoices/Wizard/StepConsultant.tsx`, `src/invoices/Wizard/StepDetails.tsx`, `src/invoices/Wizard/StepDates.tsx`, `src/invoices/Wizard/StepPayment.tsx`

- Textarea → usar `@/components/ui/textarea`
  - Reemplazar imports desde `@/shared/components/textarea`
  - Dónde: `src/invoices/Wizard/StepDetails.tsx`, `src/invoices/Wizard/StepPayment.tsx`

- Select → usar `@/components/ui/select`
  - Reemplazar imports desde `@/shared/components/select`
  - Dónde: `src/invoices/components/InvoicesFilters.tsx`, `src/invoices/Wizard/StepClient.tsx`, `src/invoices/Wizard/StepConsultant.tsx`, `src/invoices/Wizard/StepPayment.tsx`

- Switch → usar `@/components/ui/switch`
  - Reemplazar `src/shared/components/switch.tsx` cuando se necesite toggle en formularios o settings

- Badge → usar `@/components/ui/badge`
  - Reemplazar imports desde `@/shared/components/badge`
  - Dónde: `src/invoices/components/InvoiceTable.tsx`

- Dropdown Menu → usar `@/components/ui/dropdown-menu`
  - Reemplazar imports desde `@/shared/components/dropdown-menu`
  - Dónde sugerido: acciones por fila en `src/invoices/components/InvoiceTable.tsx` (sustituir los 3 botones por un menú)

- Dialog/Alert Dialog → usar `@/components/ui/dialog` y/o `@/components/ui/alert-dialog`
  - Reemplazar imports desde `@/shared/components/dialog`
  - Dónde: `src/shared/components/ConfirmDialog.tsx` debería migrar a `AlertDialog` para confirmaciones

- Card → usar `@/components/ui/card`
  - Reemplazar imports desde `@/shared/components/card`
  - Dónde: `src/invoices/components/InvoiceTable.tsx`, `src/login/index.tsx`

#### Patrones y componentes compuestos
- Date Picker → usar patrón de `Date Picker` (Popover + Calendar) de shadcn
  - Reemplazar `src/shared/components/DatePicker.tsx` por `@/components/ui/calendar` + `@/components/ui/popover`
  - Dónde: `src/invoices/components/InvoicesFilters.tsx` (campo Periodo), y sustituir `input type="date"` en `src/invoices/Wizard/StepDates.tsx`

- Combobox/Command → usar `@/components/ui/combobox` (Command + Popover)
  - Reemplazar el Autocomplete custom `src/shared/components/Autocomplete.tsx`
  - Dónde sugerido: selección de consultor/cliente en los steps del wizard (alternativa al `Select` cuando haga falta búsqueda)

- Table / Data Table → usar `@/components/ui/table` o el patrón Data Table (TanStack Table + shadcn)
  - Refactorizar `src/invoices/components/InvoiceTable.tsx` para usar la tabla de shadcn y facilitar sorting, filtros y paginación

- Sidebar → usar `@/components/ui/sidebar`
  - Reemplazar `src/shared/components/Sidebar.tsx` por la Sidebar de shadcn para tener colapsado, grupos, badges y atajos

- Toast/Sonner → usar `@/components/ui/sonner` o `@/components/ui/toast`
  - Reemplazar `react-toastify` en `src/invoices/Wizard/StepClient.tsx`, `src/invoices/Wizard/StepConsultant.tsx`, `src/invoices/Wizard/StepPayment.tsx`

- Form (React Hook Form) → usar `@/components/ui/form`
  - Migrar formularios de los steps del wizard a `react-hook-form` + componentes de shadcn para validación y mensajes consistentes

#### Notas de adopción
- Crear los componentes con el CLI de shadcn/ui para ubicarlos en `@/components/ui/*` y mantener coherencia con `components.json`
- Mantener la paleta Tailwind del proyecto y reutilizar variantes existentes al migrar
- Prioridad recomendada: Core (Button/Input/Label/Select/Textarea/Card) → Date Picker → Alert Dialog → Table/Data Table → Sidebar → Toast/Sonner → Combobox → Form

