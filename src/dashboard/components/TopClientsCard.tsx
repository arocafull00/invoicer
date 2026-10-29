import React from "react";
import { Card } from "@/components/ui/card";
import { useInvoiceStore, useSettingsStore } from "@/shared/lib/stores";
import { calculateAnnualRevenue } from "@/shared/lib/dashboardUtils";
import { formatCurrency } from "@/shared/lib/helpers";

export const TopClientsCard: React.FC = () => {
  const invoices = useInvoiceStore((s) => s.invoices);
  const isDataReady = useInvoiceStore((s) => s.isDataReady);
  const settings = useSettingsStore((s) => s.settings);
  const revenue = calculateAnnualRevenue(invoices, settings?.irpf_rate ?? 20);
  const percentageFormatter = new Intl.NumberFormat("es-ES", {
    style: "percent",
    maximumFractionDigits: 1,
  });

  return (
    <Card className="min-w-0 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          Ingresos del último año
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {revenue.startDate.toLocaleDateString("es-ES")} – {revenue.endDate.toLocaleDateString("es-ES")}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Facturas pagadas · Por fecha de factura
        </p>
      </div>

      {!isDataReady && invoices.length === 0 ? (
        <p role="status" className="py-8 text-center text-muted-foreground">
          Cargando ingresos…
        </p>
      ) : revenue.invoiceCount === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          No hay facturas pagadas en los últimos 12 meses
        </p>
      ) : (
        <div className="space-y-6">
          <dl className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <dt className="text-sm text-muted-foreground">Bruto (con IVA)</dt>
              <dd className="font-semibold tabular-nums text-foreground">
                {formatCurrency(revenue.gross)}
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <dt className="text-sm text-muted-foreground">Bruto sin IVA</dt>
              <dd className="font-semibold tabular-nums text-foreground">
                {formatCurrency(revenue.grossWithoutVat)}
              </dd>
            </div>
            <div className="border-t border-border pt-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <dt className="text-sm font-medium text-foreground">Neto estimado</dt>
                <dd className="text-lg font-bold tabular-nums text-primary">
                  {formatCurrency(revenue.net)}
                </dd>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Bruto sin IVA − {revenue.irpfRate.toLocaleString("es-ES")}% de IRPF · Sin descontar gastos
              </p>
            </div>
          </dl>

          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium text-foreground">Ingresos por cliente</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Importe y porcentaje del bruto sin IVA
            </p>
            <ul className="mt-4 space-y-4">
              {revenue.clients.map((client) => (
                <li key={client.clientId} className="space-y-2">
                  <p className="break-words text-sm font-medium text-foreground">
                    {client.clientName}
                  </p>
                  <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-sm tabular-nums">
                    <span className="text-muted-foreground">{formatCurrency(client.amount)}</span>
                    <span className="font-semibold text-primary">
                      {percentageFormatter.format(client.percentage / 100)}
                    </span>
                  </div>
                  <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-primary/10">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(100, Math.max(0, client.percentage))}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
};
