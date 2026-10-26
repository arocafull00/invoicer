import Link from "next/link";
import { FileUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceTable } from "@/invoices/components/InvoiceTable";
import { PageHeader } from "@/shared/components/PageHeader";

export default function Invoices() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Facturas"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/invoices/import">
                <FileUp className="w-4 h-4 sm:mr-2" />
                <span className="sr-only sm:not-sr-only">Importar CSV</span>
              </Link>
            </Button>
            <Button asChild>
              <Link href="/invoices/new">
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="sr-only sm:not-sr-only">Nueva Factura</span>
              </Link>
            </Button>
          </div>
        }
      />

      <InvoiceTable />
    </div>
  );
}
