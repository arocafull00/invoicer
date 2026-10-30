import { z } from 'zod';

export const taxPeriodSchema = z.object({
  year: z.number().int().min(2000).max(2200),
  quarter: z.number().int().min(1).max(4),
  model130_required: z.boolean(),
  prior_irpf_payments: z.number().finite().min(0).max(999999999),
  vat_credit: z.number().finite().min(0).max(999999999),
});
export type TaxPeriodSettings = z.infer<typeof taxPeriodSchema>;
export function defaultTaxSettings(year: number, quarter: number): TaxPeriodSettings {
  return { year, quarter, model130_required: true, prior_irpf_payments: 0, vat_credit: 0 };
}
