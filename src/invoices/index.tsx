import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceTable } from "@/invoices/components/InvoiceTable";

export default function Invoices() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Facturas</h1>
          <p className="text-[#A1A1AA] mt-1">
            Gestiona todas tus facturas en un solo lugar
          </p>
        </div>
        <Button asChild>
          <Link to="/invoices/new">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Factura
          </Link>
        </Button>
      </div>

      {/* Table */}
      <InvoiceTable />
    </div>
  );
}
