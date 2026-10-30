import { z } from 'zod';

export const MAX_EXPENSE_PDF_BYTES = 3 * 1024 * 1024;
const money = z.number({ error: 'Introduce un importe válido' }).finite().min(-99999999).max(99999999).transform((n) => Math.round(n * 100) / 100);
const date = z.string({ error: 'Indica una fecha válida' }).regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha no válida').refine((value) => {
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, 'Fecha no válida');

export const expenseInputSchema = z.object({
  date,
  fiscal_date: date.optional(),
  invoice_number: z.string().trim().max(160).default(''),
  provider: z.string({ error: 'Indica el proveedor' }).trim().min(1, 'Indica el proveedor').max(300),
  provider_nif: z.string().trim().max(60).default(''),
  concept: z.string({ error: 'Indica el concepto' }).trim().min(1, 'Indica el concepto').max(2000),
  base_amount: money,
  vat_amount: money.default(0),
  retention_amount: money.default(0),
  total: money,
  deductible_base_pct: z.number().min(0).max(100).default(100),
  deductible_vat_pct: z.number().min(0).max(100).default(100),
  currency: z.literal('EUR', { error: 'Selecciona EUR y comprueba que los importes estén en euros' }).default('EUR'),
  expense_type_id: z.string().uuid().nullable().optional(),
}).superRefine((value, ctx) => {
  if (value.total === 0) ctx.addIssue({ code: 'custom', path: ['total'], message: 'El total no puede ser cero' });
  if (Math.abs(value.base_amount + value.vat_amount - value.retention_amount - value.total) > 0.03) {
    ctx.addIssue({ code: 'custom', path: ['total'], message: 'Base + IVA − retención debe coincidir con el total' });
  }
});

export type ExpenseInput = z.infer<typeof expenseInputSchema>;

// Imported unknown values must be entered explicitly instead of silently becoming zero.
export const expenseReviewSchema = z.preprocess((value) => {
  const data = value as Partial<ExpenseInput>;
  return { ...data, vat_amount: data?.vat_amount ?? NaN, retention_amount: data?.retention_amount ?? NaN, currency: data?.currency ?? '' };
}, expenseInputSchema);

export function expenseIdentity(value: { provider: string; invoice_number: string }) {
  return value.invoice_number.trim() ? `${value.provider.trim().toLocaleLowerCase('es')}|${value.invoice_number.trim().toLocaleLowerCase('es')}` : null;
}

export function fiscalDateForQuarter(year: number, quarter: number) {
  return `${year}-${String((quarter - 1) * 3 + 1).padStart(2, '0')}-01`;
}
