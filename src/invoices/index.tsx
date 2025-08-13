
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { InvoiceTable } from "@/invoices/components/InvoiceTable";
import { useInvoiceStore } from '@/shared/lib/stores';

export default function Invoices() {
  const { invoices } = useInvoiceStore();

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

      {/* Table */}
      <InvoiceTable invoices={invoices} />
    </div>
  );
} 