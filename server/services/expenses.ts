import { createHash, randomUUID } from 'node:crypto';
import { expenseInputSchema, expenseIdentity, MAX_EXPENSE_PDF_BYTES } from '@/expenses/lib/expenseValidation';
import { getSql } from '../lib/db';
import { ApiError, isUniqueViolation } from '../lib/errors';

export function mapExpense(row: Record<string, unknown>) {
  const result = { ...row };
  for (const key of ['base_amount', 'vat_amount', 'retention_amount', 'total', 'deductible_base_pct', 'deductible_vat_pct']) result[key] = Number(row[key]);
  return result;
}

export async function listExpenses(userId: string) {
  const sql = getSql();
  const rows = await sql`
    SELECT e.*, to_char(e.date, 'YYYY-MM-DD') AS date, to_char(e.fiscal_date, 'YYYY-MM-DD') AS fiscal_date, d.filename AS document_name,
      CASE WHEN et.id IS NULL THEN NULL ELSE json_build_object('id', et.id, 'name', et.name) END AS expense_type
    FROM expenses e
    LEFT JOIN expense_types et ON et.id = e.expense_type_id AND et.user_id = e.user_id
    LEFT JOIN expense_documents d ON d.expense_id = e.id AND d.user_id = e.user_id
    WHERE e.user_id = ${userId} ORDER BY e.date DESC, e.created_at DESC
  `;
  return rows.map((row) => mapExpense(row as Record<string, unknown>));
}

export async function saveExpense(userId: string, input: unknown, file?: File | null, existingId?: string) {
  const parsed = expenseInputSchema.safeParse(input);
  if (!parsed.success) throw new ApiError(parsed.error.issues.map((i) => i.message).join('. '), 400);
  const data = parsed.data;
  const sql = getSql();
  const id = existingId ?? randomUUID();
  let bytes: Buffer | undefined;
  let hash: string | null = null;
  if (file) {
    if (!file.size || file.size > MAX_EXPENSE_PDF_BYTES) throw new ApiError('Cada PDF debe ocupar entre 1 byte y 3 MB', 400);
    bytes = Buffer.from(await file.arrayBuffer());
    if (!bytes.subarray(0, 1024).includes(Buffer.from('%PDF-'))) throw new ApiError('El archivo no es un PDF válido', 400);
    hash = createHash('sha256').update(bytes).digest('hex');
  }
  if (data.expense_type_id) {
    const types = await sql`SELECT id FROM expense_types WHERE id = ${data.expense_type_id} AND user_id = ${userId}`;
    if (!types[0]) throw new ApiError('Tipo de gasto no válido', 400);
  }
  const identity = expenseIdentity(data);
  if (identity || hash) {
    const duplicates = await sql`
      SELECT id FROM expenses WHERE user_id = ${userId} AND id <> ${id} AND (
        (${hash}::text IS NOT NULL AND source_hash = ${hash}) OR
        (${identity}::text IS NOT NULL AND lower(trim(provider)) = lower(${data.provider}) AND lower(trim(invoice_number)) = lower(${data.invoice_number}))
      ) LIMIT 1
    `;
    if (duplicates[0]) throw new ApiError('Esta factura ya está registrada. Revisa los gastos existentes.', 409);
  }
  try {
    if (existingId) {
      const rows = await sql`
        UPDATE expenses SET date = ${data.date}, invoice_number = ${data.invoice_number}, provider = ${data.provider}, concept = ${data.concept},
          fiscal_date = ${data.fiscal_date ?? data.date}, provider_nif = ${data.provider_nif}, base_amount = ${data.base_amount},
          vat_amount = ${data.vat_amount}, retention_amount = ${data.retention_amount}, total = ${data.total},
          deductible_base_pct = ${data.deductible_base_pct}, deductible_vat_pct = ${data.deductible_vat_pct},
          expense_type_id = ${data.expense_type_id ?? null}, import_identity = CASE WHEN source_hash IS NULL THEN NULL ELSE ${identity} END
        WHERE id = ${id} AND user_id = ${userId} RETURNING id
      `;
      if (!rows[0]) throw new ApiError('Gasto no encontrado', 404);
    } else {
      const insert = sql`
        INSERT INTO expenses (id, user_id, date, invoice_number, provider, concept, fiscal_date, provider_nif,
          base_amount, vat_amount, retention_amount, total, deductible_base_pct, deductible_vat_pct, currency, expense_type_id, source_hash, import_identity)
        VALUES (${id}, ${userId}, ${data.date}, ${data.invoice_number}, ${data.provider}, ${data.concept}, ${data.fiscal_date ?? data.date}, ${data.provider_nif},
          ${data.base_amount}, ${data.vat_amount}, ${data.retention_amount}, ${data.total}, ${data.deductible_base_pct}, ${data.deductible_vat_pct},
          ${data.currency}, ${data.expense_type_id ?? null}, ${hash}, ${file ? identity : null})
      `;
      await sql.transaction(bytes && file ? [insert, sql`
        INSERT INTO expense_documents (expense_id, user_id, filename, content)
        VALUES (${id}, ${userId}, ${file.name.replace(/[\r\n]/g, '').slice(0, 240)}, decode(${bytes.toString('base64')}, 'base64'))
      `] : [insert]);
    }
  } catch (error) {
    if (isUniqueViolation(error)) throw new ApiError('Esta factura ya está registrada', 409);
    throw error;
  }
  const rows = await sql`
    SELECT e.*, to_char(e.date, 'YYYY-MM-DD') AS date, to_char(e.fiscal_date, 'YYYY-MM-DD') AS fiscal_date, d.filename AS document_name,
      CASE WHEN et.id IS NULL THEN NULL ELSE json_build_object('id', et.id, 'name', et.name) END AS expense_type
    FROM expenses e LEFT JOIN expense_types et ON et.id = e.expense_type_id AND et.user_id = e.user_id
    LEFT JOIN expense_documents d ON d.expense_id = e.id AND d.user_id = e.user_id
    WHERE e.id = ${id} AND e.user_id = ${userId}
  `;
  return mapExpense(rows[0] as Record<string, unknown>);
}
