import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ExpenseInput } from '../lib/expenseValidation';

export function ExpenseFields({ value, onChange, prefix, disabled = false }: {
  value: Partial<ExpenseInput>;
  onChange: (value: Partial<ExpenseInput>) => void;
  prefix: string;
  disabled?: boolean;
}) {
  return <fieldset disabled={disabled} className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {([
      ['date', 'Fecha de factura', 'date'], ['fiscal_date', 'Fecha de imputación al trimestre', 'date'],
      ['invoice_number', 'Número de factura', 'text'], ['provider', 'Proveedor', 'text'],
      ['provider_nif', 'NIF del proveedor', 'text'], ['concept', 'Concepto', 'text'],
      ['base_amount', 'Base sin IVA (€)', 'number'], ['vat_amount', 'Cuota de IVA (€)', 'number'],
      ['retention_amount', 'Retención de IRPF (€)', 'number'], ['total', 'Total a pagar (€)', 'number'],
      ['deductible_base_pct', 'Gasto deducible (%)', 'number'], ['deductible_vat_pct', 'IVA deducible (%)', 'number'],
    ] as const).map(([key, label, type]) => <div key={key} className="min-w-0 space-y-2">
      <Label htmlFor={`${prefix}-${key}`}>{label}</Label>
      <Input id={`${prefix}-${key}`} type={type} step={type === 'number' ? '0.01' : undefined}
        min={key.endsWith('_pct') ? 0 : undefined} max={key.endsWith('_pct') ? 100 : undefined}
        value={key === 'fiscal_date' ? value.fiscal_date ?? value.date ?? '' : value[key] ?? ''}
        onChange={(e) => onChange({ ...value, [key]: type === 'number' ? e.target.value === '' ? undefined : Number(e.target.value) : e.target.value })} />
    </div>)}
    <div className="space-y-2">
      <Label htmlFor={`${prefix}-currency`}>Moneda de los importes</Label>
      <select id={`${prefix}-currency`} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        value={value.currency ?? ''} onChange={(e) => onChange({ ...value, currency: e.target.value === 'EUR' ? 'EUR' : undefined })}>
        <option value="">Selecciona la moneda</option><option value="EUR">EUR · Euros</option>
      </select>
    </div>
    <p className="text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">La fecha de factura se conserva. La fecha de imputación determina el trimestre del gasto y del IVA. Ajusta los porcentajes si solo una parte es deducible.</p>
  </fieldset>;
}
