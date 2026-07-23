import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useInvoiceStore, useSettingsStore } from "@/shared/lib/stores";
import { getRecentInvoices } from "@/shared/lib/dashboardUtils";
import { formatCurrency, formatDate } from "@/shared/lib/helpers";

export const RecentInvoices: React.FC = () => {
  const { invoices } = useInvoiceStore();
  useSettingsStore((s) => s.settings);
  const recentInvoices = getRecentInvoices(invoices, 5);

  if (recentInvoices.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Facturas Recientes
          </h2>
          <Button
            variant="ghost"
            asChild
            className="text-primary hover:bg-primary/10"
          >
            <Link href="/invoices">Ver todas</Link>
          </Button>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay facturas recientes</p>
          <Button asChild className="mt-4">
            <Link href="/invoices/new">Crear primera factura</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          Facturas Recientes
        </h2>
        <Button
          variant="ghost"
          asChild
          className="text-primary hover:bg-primary/10"
        >
          <Link href="/invoices">Ver todas</Link>
        </Button>
      </div>
      <div className="space-y-4">
        {recentInvoices.map(
          ({ id, number, client, total, start_date, status }) => {
            return (
              <div
                key={id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{number}</p>
                  <p className="text-sm text-muted-foreground">{client.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {formatCurrency(total)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(start_date)}
                  </p>
                </div>
                <div className="ml-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      status === "paid"
                        ? "bg-green-500/20 text-green-400"
                        : status === "pending"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : status === "overdue"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {status === "paid"
                      ? "Pagada"
                      : status === "pending"
                      ? "Pendiente"
                      : status === "overdue"
                      ? "Vencida"
                      : status}
                  </span>
                </div>
              </div>
            );
          }
        )}
      </div>
    </Card>
  );
};
