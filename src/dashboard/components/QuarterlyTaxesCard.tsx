import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInvoiceStore, useSettingsStore } from '@/shared/lib/stores';
import { useExpensesStore } from '@/expenses/store/useExpensesStore';
import { getQuarterlyPeriod, calculateQuarterlyTaxes } from '@/shared/lib/dashboardUtils';
import { formatCurrency } from '@/shared/lib/helpers';
import { request } from '@/shared/api/client';
import { defaultTaxSettings, TAX_PERIOD_CACHE_KEY, taxPeriodSchema, type TaxPeriodSettings } from '@/expenses/lib/taxSettings';
import { useAppCache } from '@/shared/lib/appCache';

function cachedPeriod(userId: string, year: number, quarter: number) {
  try {
    const cache = JSON.parse(localStorage.getItem(TAX_PERIOD_CACHE_KEY) ?? '{}');
    const parsed = taxPeriodSchema.safeParse(cache[`${userId}:${year}:${quarter}`]);
    return parsed.success ? parsed.data : undefined;
  } catch { return undefined; }
}
function cachePeriod(userId: string, value: TaxPeriodSettings) {
  try {
    const cache = JSON.parse(localStorage.getItem(TAX_PERIOD_CACHE_KEY) ?? '{}');
    cache[`${userId}:${value.year}:${value.quarter}`] = value;
    localStorage.setItem(TAX_PERIOD_CACHE_KEY, JSON.stringify(cache));
  } catch { /* In-memory settings remain usable without browser storage. */ }
}

function TaxSettingsForm({ initial, onSave }: { initial: TaxPeriodSettings; onSave: (value: TaxPeriodSettings) => Promise<void> }) {
  const [value, setValue] = useState(initial);
  const [pending, setPending] = useState(false);
  return <form className="mt-4 space-y-4" onSubmit={(e) => {
    e.preventDefault();
    const parsed = taxPeriodSchema.safeParse(value);
    if (!parsed.success) { toast.error('Revisa los importes de los ajustes'); return; }
    setPending(true);
    void onSave(parsed.data).finally(() => setPending(false));
  }}>
    <label className="flex items-start gap-3 text-sm"><input className="mt-1 size-4 accent-primary" type="checkbox" checked={value.model130_required} onChange={(e) => setValue({ ...value, model130_required: e.target.checked })} />Debo presentar el modelo 130 en este trimestre.</label>
    {value.model130_required && value.quarter > 1 ? <div className="space-y-2">
      <Label htmlFor="tax-prior-irpf">Importe de la casilla 05 (€)</Label>
      <Input id="tax-prior-irpf" aria-describedby="tax-prior-irpf-help" type="number" min="0" step="0.01"
        value={value.prior_irpf_payments ?? ''} onChange={(e) => setValue({ ...value, prior_irpf_payments: e.target.value === '' ? null : e.target.valueAsNumber })} />
      <p id="tax-prior-irpf-help" className="text-xs text-muted-foreground">Suma las casillas 07 positivas de los modelos 130 anteriores del mismo año y resta sus casillas 16. Déjalo en blanco para usar la estimación de Invoicer. Escribe 0 si el importe es cero.</p>
    </div> : null}
    <div className="space-y-2"><Label htmlFor="tax-vat-credit">IVA pendiente de compensar (€)</Label><Input id="tax-vat-credit" type="number" min="0" step="0.01" required value={value.vat_credit} onChange={(e) => setValue({ ...value, vat_credit: e.target.valueAsNumber })} /></div>
    <Button type="submit" size="sm" disabled={pending}>{pending ? 'Guardando…' : 'Guardar ajustes del trimestre'}</Button>
  </form>;
}

export function QuarterlyTaxesCard() {
  const invoices = useInvoiceStore((s) => s.invoices);
  const expenses = useExpensesStore((s) => s.expenses);
  const rate = useSettingsStore((s) => s.settings?.irpf_rate ?? 20);
  const { userId } = useAuth();
  const cachedOwner = useAppCache((s) => s.owner);
  const settingsOwner = userId === undefined ? cachedOwner : userId;
  const queryClient = useQueryClient();
  const [offset, setOffset] = useState(0);
  const period = getQuarterlyPeriod(offset);
  const queryKey = ['tax-period', settingsOwner, period.year, period.quarter];
  const query = useQuery({ queryKey, enabled: Boolean(userId), staleTime: 30_000,
    initialData: () => settingsOwner ? cachedPeriod(settingsOwner, period.year, period.quarter) : undefined,
    initialDataUpdatedAt: 0,
    queryFn: async ({ signal }) => {
      const generation = useAppCache.getState().generation;
      const data = await request<TaxPeriodSettings>(`/tax-period-settings?year=${period.year}&quarter=${period.quarter}`, { signal });
      if (userId && generation === useAppCache.getState().generation) cachePeriod(userId, data);
      return data;
    },
  });
  const options = query.data ?? defaultTaxSettings(period.year, period.quarter);
  const taxes = calculateQuarterlyTaxes(invoices, period, expenses, rate, options);
  const estimatedPriorIrpf = options.model130_required && period.quarter > 1 && options.prior_irpf_payments === null;
  const line = (label: string, value: number) => <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1" key={label}><dt className="text-sm text-muted-foreground">{label}</dt><dd className="font-medium tabular-nums">{formatCurrency(value)}</dd></div>;
  return <Card className="min-w-0 p-6">
    <div className="mb-5 flex items-start justify-between gap-2"><div><h2 className="text-xl font-semibold">Resumen trimestral</h2><p aria-live="polite" className="mt-1 text-sm text-muted-foreground">{period.label} · Pago en {period.paymentMonth}</p></div>
      <div className="flex shrink-0 gap-1"><Button variant="ghost" size="icon" aria-label="Trimestre anterior" onClick={() => setOffset((v) => v - 1)}><ChevronLeft className="size-4" /></Button><Button variant="ghost" size="icon" aria-label="Trimestre siguiente" onClick={() => setOffset((v) => v + 1)}><ChevronRight className="size-4" /></Button></div>
    </div>
    <dl className="space-y-3">
      {line('Facturación sin IVA', taxes.income)}{line('Gastos deducibles', taxes.expenses)}{line('Beneficio antes de impuestos', taxes.profit)}
      <div className="space-y-3 border-t border-border pt-3">{line('IVA repercutido', taxes.vatCharged)}{line('IVA deducible', taxes.vatDeductible)}{line('IVA a ingresar estimado', taxes.totalIva)}{taxes.vatToCarry > 0 ? line('IVA a compensar', taxes.vatToCarry) : null}</div>
      <div className="space-y-3 border-t border-border pt-3">
        {line(options.model130_required ? 'Modelo 130 estimado' : 'Modelo 130 · No obligado', taxes.totalIrpf)}
        {options.model130_required ? <div className="space-y-2 pl-3">
          {line('Cuota acumulada desde enero', taxes.annualIrpfQuota)}
          {line('Retenciones acumuladas en facturas', taxes.annualRetentions)}
          {period.quarter > 1 ? line(estimatedPriorIrpf ? 'Casilla 05 · Estimada' : 'Casilla 05 · Informada', taxes.priorIrpfPayments) : null}
        </div> : null}
      </div>
      {taxes.supplierRetentions > 0 ? line('Retenciones en gastos (111/115)', taxes.supplierRetentions) : null}
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-border pt-3"><dt className="font-medium">Reserva para la trimestral</dt><dd className="text-lg font-bold tabular-nums text-primary">{formatCurrency(taxes.totalTaxes)}</dd></div>
      {line('Neto orientativo del trimestre', taxes.net)}
    </dl>
    <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Estimación por fecha de factura, incluidas las pendientes de cobro, y fecha de imputación de gastos. El neto orientativo descuenta un {rate}% del beneficio positivo del trimestre.</p>
    {estimatedPriorIrpf ? <p className="mt-3 text-sm text-muted-foreground">La reserva supone que los trimestres anteriores se declararon con los datos de Invoicer. Introduce la casilla 05 en los ajustes si tienes el importe real.</p> : null}
    {query.isError ? <p role="alert" className="mt-3 text-sm text-destructive">No se han podido actualizar los ajustes fiscales. <button className="underline" onClick={() => void query.refetch()}>Reintentar</button></p> : null}
    <details className="mt-5 border-t border-border pt-4"><summary className="cursor-pointer text-sm font-medium">Ajustes fiscales de {period.label}</summary>
      <TaxSettingsForm key={`${period.year}-${period.quarter}-${JSON.stringify(query.data)}`} initial={options} onSave={async (value) => {
        const generation = useAppCache.getState().generation;
        try {
          const saved = await request<TaxPeriodSettings>('/tax-period-settings', { method: 'PUT', body: JSON.stringify(value) });
          await queryClient.cancelQueries({ queryKey, exact: true });
          if (generation !== useAppCache.getState().generation) return;
          if (userId) cachePeriod(userId, saved);
          queryClient.setQueryData(queryKey, saved); toast.success('Ajustes fiscales guardados');
        } catch (error) { toast.error(error instanceof Error ? error.message : 'No se pudieron guardar los ajustes'); }
      }} />
      <p className="mt-4 text-xs text-muted-foreground">No incluye particularidades de regímenes especiales, amortizaciones, prorratas ni todas las reducciones fiscales. Confirma los criterios de deducción y la obligación del modelo 130 con tu gestoría.</p>
    </details>
  </Card>;
}
