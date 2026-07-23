import React from "react";
import { Card } from "@/components/ui/card";
import { useInvoiceStore, useSettingsStore } from "@/shared/lib/stores";
import {
  getTopClientsBySpend,
  getTopClientsByVisits,
} from "@/shared/lib/dashboardUtils";
import { formatCurrency } from "@/shared/lib/helpers";
import { TopClientRankSection } from "./TopClientRankSection";

export const TopClientsCard: React.FC = () => {
  const { invoices } = useInvoiceStore();
  useSettingsStore((s) => s.settings);

  const topByVisits = getTopClientsByVisits(invoices, 5);
  const topBySpend = getTopClientsBySpend(invoices, 5);
  const hasClients = topByVisits.length > 0 || topBySpend.length > 0;

  if (!hasClients) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Mejores Clientes
        </h2>
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay clientes con facturas todavía</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">
        Mejores Clientes
      </h2>
      <div className="space-y-6">
        <TopClientRankSection
          title="Más frecuentes"
          clients={topByVisits}
          getValueLabel={(client) =>
            `${client.invoiceCount} factura${client.invoiceCount === 1 ? "" : "s"}`
          }
        />
        <TopClientRankSection
          title="Mayor gasto"
          clients={topBySpend}
          getValueLabel={(client) => formatCurrency(client.totalSpent)}
        />
      </div>
    </Card>
  );
};
