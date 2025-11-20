import React from "react";
import { Card } from "@/components/ui/card";
import { useInvoiceStore } from "@/shared/lib/stores";
import {
  getNextQuarterlyPeriod,
  calculateQuarterlyTaxes,
  formatCurrency,
} from "@/shared/lib/dashboardUtils";

export const QuarterlyTaxesCard: React.FC = () => {
  const { invoices } = useInvoiceStore();
  const period = getNextQuarterlyPeriod();
  const taxes = calculateQuarterlyTaxes(invoices, period);

  const hasInvoices = taxes.monthlyBreakdown.some(
    (m) => m.irpf > 0 || m.iva > 0
  );

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          Impuestos Trimestrales
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Próximo pago en {period.paymentMonth}
        </p>
      </div>

      {!hasInvoices ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay facturas en este período</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {taxes.monthlyBreakdown.map((month) => {
              if (month.irpf === 0 && month.iva === 0) return null;

              return (
                <div
                  key={month.month}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{month.month}</p>
                    <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                      <span>IRPF: {formatCurrency(month.irpf)}</span>
                      <span>IVA: {formatCurrency(month.iva)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {formatCurrency(month.irpf + month.iva)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-border space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">
                Total IRPF:
              </span>
              <span className="font-semibold text-foreground">
                {formatCurrency(taxes.totalIrpf)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">
                Total IVA:
              </span>
              <span className="font-semibold text-foreground">
                {formatCurrency(taxes.totalIva)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-base font-semibold text-foreground">
                Total a pagar:
              </span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(taxes.totalTaxes)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-medium text-foreground">
                Total facturado:
              </span>
              <span className="font-semibold text-foreground">
                {formatCurrency(taxes.totalInvoiced)}
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
