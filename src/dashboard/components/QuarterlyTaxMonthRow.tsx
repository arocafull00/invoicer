import React from "react";
import { formatCurrency } from "@/shared/lib/dashboardUtils";

interface QuarterlyTaxMonthRowProps {
  month: string;
  irpf: number;
  iva: number;
}

export const QuarterlyTaxMonthRow: React.FC<QuarterlyTaxMonthRowProps> = ({
  month,
  irpf,
  iva,
}) => {
  if (irpf === 0 && iva === 0) return null;

  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div className="flex-1">
        <p className="font-medium text-foreground">{month}</p>
        <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
          <span>IRPF: {formatCurrency(irpf)}</span>
          <span>IVA: {formatCurrency(iva)}</span>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-foreground">
          {formatCurrency(irpf + iva)}
        </p>
      </div>
    </div>
  );
};
