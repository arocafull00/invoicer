import type { ExpenseType } from "@/shared/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExpenseTypeSelectItem } from "@/expenses/components/ExpenseTypeSelectItem";

export interface ExpenseFormValues {
  date: string;
  invoice_number: string;
  provider: string;
  concept: string;
  base_amount: string;
  vat_amount: string;
  expense_type_id: string;
  new_expense_type: string;
}

export const emptyExpenseForm = (): ExpenseFormValues => ({
  date: new Date().toISOString().slice(0, 10),
  invoice_number: "",
  provider: "",
  concept: "",
  base_amount: "",
  vat_amount: "",
  expense_type_id: "",
  new_expense_type: "",
});

export function parseAmount(value: string): number {
  const normalized = value.replace(",", ".").trim();
  if (!normalized) return 0;
  const parsed = Number(normalized);
  if (Number.isNaN(parsed)) return 0;
  return parsed;
}

export function ExpenseForm({
  value,
  onChange,
  expenseTypes,
}: {
  value: ExpenseFormValues;
  onChange: (v: ExpenseFormValues) => void;
  expenseTypes: ExpenseType[];
}) {
  const base = parseAmount(value.base_amount);
  const vat = parseAmount(value.vat_amount);
  const total = base + vat;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="expense-date">Fecha</Label>
        <Input
          id="expense-date"
          type="date"
          value={value.date}
          onChange={(e) => onChange({ ...value, date: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="expense-invoice-number">Nº Factura (Opcional)</Label>
        <Input
          id="expense-invoice-number"
          value={value.invoice_number}
          onChange={(e) =>
            onChange({ ...value, invoice_number: e.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="expense-provider">Proveedor</Label>
        <Input
          id="expense-provider"
          value={value.provider}
          onChange={(e) => onChange({ ...value, provider: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="expense-concept">Concepto</Label>
        <Input
          id="expense-concept"
          value={value.concept}
          onChange={(e) => onChange({ ...value, concept: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="expense-base">Base imponible</Label>
        <Input
          id="expense-base"
          type="number"
          step="0.01"
          min="0"
          value={value.base_amount}
          onChange={(e) => onChange({ ...value, base_amount: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="expense-vat">IVA</Label>
        <Input
          id="expense-vat"
          type="number"
          step="0.01"
          min="0"
          value={value.vat_amount}
          onChange={(e) => onChange({ ...value, vat_amount: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="expense-total">Total</Label>
        <Input
          id="expense-total"
          value={total.toFixed(2)}
          readOnly
          className="bg-muted"
        />
      </div>
      <div className="space-y-2">
        <Label>Tipo de gasto (Opcional)</Label>
        <Select
          value={value.expense_type_id || undefined}
          onValueChange={(expense_type_id) =>
            onChange({
              ...value,
              expense_type_id,
              new_expense_type: "",
            })
          }
          disabled={Boolean(value.new_expense_type.trim())}
        >
          <SelectTrigger className="w-full bg-input border-border text-card-foreground">
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {expenseTypes.map((type) => (
              <ExpenseTypeSelectItem key={type.id} type={type} />
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="expense-new-type">O crear nuevo tipo</Label>
        <Input
          id="expense-new-type"
          value={value.new_expense_type}
          placeholder="Nombre del tipo de gasto"
          onChange={(e) =>
            onChange({
              ...value,
              new_expense_type: e.target.value,
              expense_type_id: e.target.value.trim()
                ? ""
                : value.expense_type_id,
            })
          }
        />
      </div>
    </div>
  );
}
