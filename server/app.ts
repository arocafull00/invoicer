import { Hono } from 'hono';
import { getSql } from './lib/db.js';
import { ApiError } from './lib/errors.js';
import { clerkAuth, type AppEnv } from './lib/auth.js';
import { registerConsultantRoutes } from './routes/consultants.js';
import { registerClientRoutes } from './routes/clients.js';
import { registerPaymentInstructionRoutes } from './routes/payment-instructions.js';
import { registerInvoiceRoutes } from './routes/invoices.js';
import { registerLineItemTemplateRoutes } from './routes/line-item-templates.js';
import { registerSettingsRoutes } from './routes/settings.js';

export const app = new Hono<AppEnv>().basePath('/api');

app.use('*', clerkAuth());

app.onError((error, c) => {
  if (error instanceof ApiError) {
    return c.json({ error: error.message }, error.status);
  }
  console.error(error);
  const message = error instanceof Error ? error.message : 'Internal server error';
  return c.json({ error: message }, 500);
});

const sql = getSql();

registerConsultantRoutes(app, sql);
registerClientRoutes(app, sql);
registerPaymentInstructionRoutes(app, sql);
registerInvoiceRoutes(app, sql);
registerLineItemTemplateRoutes(app, sql);
registerSettingsRoutes(app, sql);
