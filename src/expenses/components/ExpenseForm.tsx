import type { Expense, ExpenseType } from '@/shared/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';

export type ExpenseFormValue = Partial<Omit<Expense, 'id' | 'user_id'>> & {
  expense_type?: ExpenseType;
};

export function ExpenseForm({
  value,
  onChange,
  expenseTypes,
  onCreateExpenseType,
}: {
  value: ExpenseFormValue;
  onChange: (v: ExpenseFormValue) => void;
  expenseTypes: ExpenseType[];
  onCreateExpenseType: (name: string) => Promise<ExpenseType>;
}) {
  const base = Number(value.base_amount || 0);
  const vat = Number(value.vat_amount || 0);
  const total = base + vat;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="date">Fecha</Label>
        <Input
          id="date"
          type="date"
          value={value.date || ''}
          onChange={(e) => onChange({ ...value, date: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="invoice_number">Nº Factura</Label>
        <Input
          id="invoice_number"
          value={value.invoice_number || ''}
          onChange={(e) => onChange({ ...value, invoice_number: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="provider">Proveedor</Label>
        <Input
          id="provider"
          value={value.provider || ''}
          onChange={(e) => onChange({ ...value, provider: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Tipo de gasto</Label>
        <Select
          value={value.expense_type?.id || ''}
          onValueChange={async (id) => {
            if (id === '__create__') {
              const name = window.prompt('Nombre del tipo de gasto');
              if (name && name.trim()) {
                const created = await onCreateExpenseType(name.trim());
                onChange({ ...value, expense_type: created });
              }
              return;
            }
            onChange({ ...value, expense_type: expenseTypes.find((t) => t.id === id) });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona tipo de gasto" />
          </SelectTrigger>
          <SelectContent>
            {expenseTypes.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
            <SelectSeparator />
            <SelectItem value="__create__">Crear tipo de gasto</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="concept">Concepto</Label>
        <Input
          id="concept"
          value={value.concept || ''}
          onChange={(e) => onChange({ ...value, concept: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="base_amount">Base imponible (€)</Label>
        <Input
          id="base_amount"
          type="number"
          step="0.01"
          value={value.base_amount?.toString() || ''}
          onChange={(e) => onChange({ ...value, base_amount: Number(e.target.value), total: Number(e.target.value || 0) + (Number(value.vat_amount || 0)) })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="vat_amount">IVA (€)</Label>
        <Input
          id="vat_amount"
          type="number"
          step="0.01"
          value={value.vat_amount?.toString() || ''}
          onChange={(e) => onChange({ ...value, vat_amount: Number(e.target.value), total: (Number(value.base_amount || 0)) + Number(e.target.value || 0) })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="total">Total (€)</Label>
        <Input id="total" value={total.toFixed(2)} disabled />
      </div>
    </div>
  );
}


