import { Hono } from 'hono';
import { getSql } from './lib/db';
import { ApiError } from './lib/errors';
import { basicAuth } from './lib/auth';
import { registerConsultantRoutes } from './routes/consultants';
import { registerClientRoutes } from './routes/clients';
import { registerPaymentInstructionRoutes } from './routes/payment-instructions';
import { registerInvoiceRoutes } from './routes/invoices';
import { registerLineItemTemplateRoutes } from './routes/line-item-templates';
import { registerSettingsRoutes } from './routes/settings';

export const app = new Hono().basePath('/api');

app.use('*', basicAuth());

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
