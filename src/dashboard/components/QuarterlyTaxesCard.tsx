import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInvoiceStore } from "@/shared/lib/stores";
import {
  getQuarterlyPeriod,
  calculateQuarterlyTaxes,
  formatCurrency,
} from "@/shared/lib/dashboardUtils";
import { QuarterlyTaxMonthRow } from "./QuarterlyTaxMonthRow";

export const QuarterlyTaxesCard: React.FC = () => {
  const { invoices } = useInvoiceStore();
  const [offset, setOffset] = useState(0);
  const period = getQuarterlyPeriod(offset);
  const taxes = calculateQuarterlyTaxes(invoices, period);

  const hasInvoices = taxes.monthlyBreakdown.some(
    (m) => m.irpf > 0 || m.iva > 0
  );

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-semibold text-foreground">
            Impuestos Trimestrales
          </h2>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Trimestre anterior"
              onClick={() => setOffset((value) => value - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Trimestre siguiente"
              onClick={() => setOffset((value) => value + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {period.label} · Pago en {period.paymentMonth}
        </p>
      </div>

      {!hasInvoices ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay facturas en este período</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {taxes.monthlyBreakdown.map((month) => (
              <QuarterlyTaxMonthRow
                key={month.month}
                month={month.month}
                irpf={month.irpf}
                iva={month.iva}
              />
            ))}
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
