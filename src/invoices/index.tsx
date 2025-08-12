
import { Link } from 'react-router-dom';
import { Search, Filter, Plus } from 'lucide-react';
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { InvoiceTable } from "@/invoices/components/InvoiceTable";

export default function Invoices() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Facturas</h1>
          <p className="text-[#A1A1AA] mt-1">Gestiona todas tus facturas en un solo lugar</p>
        </div>
        <Button asChild className="bg-[#7F5AF0] text-white hover:bg-[#7F5AF0]/90">
          <Link to="/invoices/new">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Factura
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
          <Input
            placeholder="Buscar facturas..."
            className="pl-10 bg-[#0D0D0D] border-[#FFFFFF14] text-white placeholder:text-[#A1A1AA]"
          />
        </div>
        <Button variant="outline" className="bg-[#0D0D0D] border-[#FFFFFF14] text-white hover:bg-[#FFFFFF14]">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Table */}
      <InvoiceTable />
    </div>
  );
} 