import Link from "next/link";
import { FileUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceTable } from "@/invoices/components/InvoiceTable";

export default function Invoices() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Facturas</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona todas tus facturas en un solo lugar
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/invoices/import">
              <FileUp className="w-4 h-4 mr-2" />
              Importar CSV
            </Link>
          </Button>
          <Button asChild>
            <Link href="/invoices/new">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Factura
            </Link>
          </Button>
        </div>
      </div>

      <InvoiceTable />
    </div>
  );
}
