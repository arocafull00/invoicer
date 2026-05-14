import { z } from "zod";

const fieldErrorsSchema = z.record(z.string(), z.string()).optional();

export const ingresoImportItemSchema = z.object({
  kind: z.literal("income"),
  date: z.string(),
  concept: z.string(),
  amount: z.number(),
  payment_method: z.enum(["cash", "transfer", "bizum"]),
  client_name: z.string(),
  field_errors: fieldErrorsSchema,
});

export const facturaImportItemSchema = z.object({
  kind: z.literal("invoice"),
  number: z.string(),
  invoice_date: z.string(),
  service_date: z.string(),
  concept: z.string(),
  client_name: z.string(),
  client_nif: z.string().nullable(),
  base_amount: z.number(),
  irpf_percent: z.number().nullable(),
  irpf_amount: z.number().nullable(),
  payment_method_raw: z.string().nullable(),
  field_errors: fieldErrorsSchema,
});

export const parseIngresosCsvResponseSchema = z.object({
  ingresos: z.array(ingresoImportItemSchema),
  facturas: z.array(facturaImportItemSchema),
  error: z.string().nullable().optional(),
});

export type IngresoImportRow = z.infer<typeof ingresoImportItemSchema>;
export type FacturaImportRow = z.infer<typeof facturaImportItemSchema>;
