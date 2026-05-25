import pg from 'pg';
import { neon } from '@neondatabase/serverless';

const sourceUrl = process.env.SUPABASE_DATABASE_URL;
const targetUrl = process.env.DATABASE_URL;

if (!sourceUrl || !targetUrl) {
  console.error('Required env vars: SUPABASE_DATABASE_URL, DATABASE_URL');
  process.exit(1);
}

const source = new pg.Client({ connectionString: sourceUrl, ssl: { rejectUnauthorized: false } });
const target = neon(targetUrl);

async function getPrimaryUserId() {
  const { rows } = await source.query(`
    SELECT user_id::text, COUNT(*)::int AS count
    FROM invoices
    GROUP BY user_id
    ORDER BY count DESC
    LIMIT 1
  `);
  if (!rows[0]) {
    throw new Error('No invoices found in Supabase');
  }
  console.log(`Using primary user_id: ${rows[0].user_id} (${rows[0].count} invoices)`);
  return rows[0].user_id;
}

async function clearTarget() {
  await target`
    TRUNCATE invoice_line_items, invoices, line_item_templates, payment_instructions, clients, consultants, user_settings RESTART IDENTITY CASCADE
  `;
  await target`
    INSERT INTO user_settings (default_currency, date_format, pdf_color_palette)
    VALUES ('eur', 'dd/mm/yyyy', 'violet')
  `;
}

async function migrateConsultants(userId) {
  const { rows } = await source.query(
    `SELECT id, name, email, address, city, country, nif, created_at, updated_at
     FROM consultants WHERE user_id = $1`,
    [userId]
  );
  console.log(`Migrating consultants: ${rows.length} rows`);
  for (const row of rows) {
    await target`
      INSERT INTO consultants (id, name, email, address, city, country, nif, created_at, updated_at)
      VALUES (
        ${row.id}, ${row.name}, ${row.email}, ${row.address}, ${row.city}, ${row.country}, ${row.nif},
        ${row.created_at}, ${row.updated_at}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }
}

async function migrateClients(userId) {
  const { rows } = await source.query(
    `SELECT id, name, email, address, city, country, company_number, created_at, updated_at
     FROM clients WHERE user_id = $1`,
    [userId]
  );
  console.log(`Migrating clients: ${rows.length} rows`);
  for (const row of rows) {
    await target`
      INSERT INTO clients (id, name, email, address, city, country, company_number, created_at, updated_at)
      VALUES (
        ${row.id}, ${row.name}, ${row.email ?? ''}, ${row.address}, ${row.city}, ${row.country},
        ${row.company_number}, ${row.created_at}, ${row.updated_at}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }
}

async function migratePaymentInstructions(userId) {
  const { rows } = await source.query(
    `SELECT id, account_holder, iban, payment_method, payment_terms, additional_data, created_at, updated_at
     FROM payment_instructions WHERE user_id = $1`,
    [userId]
  );
  console.log(`Migrating payment_instructions: ${rows.length} rows`);
  for (const row of rows) {
    await target`
      INSERT INTO payment_instructions (
        id, account_holder, iban, payment_method, payment_terms, additional_data, created_at, updated_at
      )
      VALUES (
        ${row.id}, ${row.account_holder}, ${row.iban}, ${row.payment_method},
        ${row.payment_terms}, ${row.additional_data}, ${row.created_at}, ${row.updated_at}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }
}

async function migrateLineItemTemplates(userId) {
  const { rows } = await source.query(
    `SELECT id, description, default_quantity, default_rate, category, usage_count, last_used_at, created_at, updated_at
     FROM line_item_templates WHERE user_id = $1`,
    [userId]
  );
  console.log(`Migrating line_item_templates: ${rows.length} rows`);
  for (const row of rows) {
    await target`
      INSERT INTO line_item_templates (
        id, description, default_quantity, default_rate, category, usage_count, last_used_at, created_at, updated_at
      )
      VALUES (
        ${row.id}, ${row.description}, ${row.default_quantity}, ${row.default_rate}, ${row.category},
        ${row.usage_count}, ${row.last_used_at}, ${row.created_at}, ${row.updated_at}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }
}

async function migrateInvoices(userId) {
  const { rows } = await source.query('SELECT * FROM invoices WHERE user_id = $1', [userId]);
  console.log(`Migrating invoices: ${rows.length} rows`);
  for (const row of rows) {
    await target`
      INSERT INTO invoices (
        id, number, created_date, start_date, end_date, consultant_id, client_id, payment_instructions_id,
        description, subtotal, vat_rate, vat_amount, total, vat_exempt, status, deleted, irpf_rate, irpf_amount,
        created_at, updated_at
      )
      VALUES (
        ${row.id}, ${row.number}, ${row.created_date}, ${row.start_date}, ${row.end_date},
        ${row.consultant_id}, ${row.client_id}, ${row.payment_instructions_id},
        ${row.description ?? ''}, ${row.subtotal}, ${row.vat_rate}, ${row.vat_amount}, ${row.total},
        ${row.vat_exempt}, ${row.status ?? 'pending'}, ${row.deleted ?? false}, ${row.irpf_rate}, ${row.irpf_amount},
        ${row.created_at}, ${row.updated_at}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }
}

async function migrateInvoiceLineItems(userId) {
  const { rows } = await source.query(
    `SELECT id, invoice_id, description, quantity, rate, total, COALESCE(include_vat, false) AS include_vat, order_index, created_at, updated_at
     FROM invoice_line_items WHERE user_id = $1`,
    [userId]
  );
  console.log(`Migrating invoice_line_items: ${rows.length} rows`);
  for (const row of rows) {
    await target`
      INSERT INTO invoice_line_items (
        id, invoice_id, description, quantity, rate, total, include_vat, order_index, created_at, updated_at
      )
      VALUES (
        ${row.id}, ${row.invoice_id}, ${row.description}, ${row.quantity}, ${row.rate}, ${row.total},
        ${row.include_vat}, ${row.order_index}, ${row.created_at}, ${row.updated_at}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }
}

async function migrateSettings(userId) {
  const { rows } = await source.query(
    `SELECT id, default_currency, date_format, created_at, updated_at
     FROM user_settings WHERE user_id = $1 LIMIT 1`,
    [userId]
  );
  if (!rows[0]) return;

  const existing = await target`SELECT id FROM user_settings LIMIT 1`;
  if (existing[0]) {
    await target`
      UPDATE user_settings SET
        default_currency = ${rows[0].default_currency},
        date_format = ${rows[0].date_format}
      WHERE id = ${existing[0].id}
    `;
    return;
  }

  await target`
    INSERT INTO user_settings (default_currency, date_format, pdf_color_palette, created_at, updated_at)
    VALUES (${rows[0].default_currency}, ${rows[0].date_format}, 'violet', ${rows[0].created_at}, ${rows[0].updated_at})
  `;
}

async function run() {
  await source.connect();
  try {
    const userId = await getPrimaryUserId();
    await clearTarget();
    await migrateConsultants(userId);
    await migrateClients(userId);
    await migratePaymentInstructions(userId);
    await migrateLineItemTemplates(userId);
    await migrateInvoices(userId);
    await migrateInvoiceLineItems(userId);
    await migrateSettings(userId);
    console.log('Migration complete');
  } finally {
    await source.end();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
