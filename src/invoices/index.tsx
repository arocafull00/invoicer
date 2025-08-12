
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from "@/shared/components/button";
import { InvoiceTable } from "@/invoices/components/InvoiceTable";
import InvoicesFilters from "@/invoices/components/InvoicesFilters";
import type { InvoiceFiltersState } from "@/invoices/components/InvoicesFilters";
import { useMemo, useState } from 'react';
import { useInvoiceStore } from '@/shared/lib/stores';
import type { Invoice } from '@/shared/types';

export default function Invoices() {
  const { invoices } = useInvoiceStore();
  const [filters, setFilters] = useState<InvoiceFiltersState>({
    search: "",
    consultantId: "all",
    clientId: "all",
    periodStart: null,
    periodEnd: null,
    status: "all",
    sort: "number_desc",
  });

  const extractInvoiceNumber = (numberStr: string): number => {
    const match = numberStr.match(/\d+/g);
    if (!match) return Number.NEGATIVE_INFINITY;
    return parseInt(match[match.length - 1], 10);
  };

  const normalized = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

  const filteredInvoices: Invoice[] = useMemo(() => {
    const term = normalized(filters.search);

    let list = invoices.filter((inv) => {
      // Search by number, description, consultant, client
      const inSearch = !term || [
        inv.number,
        inv.description || "",
        inv.consultant?.name || "",
        inv.client?.name || "",
      ].some((field) => normalized(String(field)).includes(term));

      // Consultant filter
      const consultantOk = filters.consultantId === 'all' || inv.consultant?.id === filters.consultantId;

      // Client filter
      const clientOk = filters.clientId === 'all' || inv.client?.id === filters.clientId;

      // Period filter (inclusive)
      const startOk = !filters.periodStart || new Date(inv.start_date) >= new Date(filters.periodStart);
      const endOk = !filters.periodEnd || new Date(inv.end_date) <= new Date(filters.periodEnd);

      // Status filter (uses optional inv.status, default 'paid' if missing to keep UX working)
      const currentStatus = (inv as { status?: 'paid' | 'pending' | 'overdue' }).status ?? 'paid';
      const statusOk = filters.status === 'all' || currentStatus === filters.status;

      return inSearch && consultantOk && clientOk && startOk && endOk && statusOk;
    });

    // Sorting
    switch (filters.sort) {
      case 'number_asc':
        list = [...list].sort((a, b) => extractInvoiceNumber(a.number) - extractInvoiceNumber(b.number));
        break;
      case 'number_desc':
        list = [...list].sort((a, b) => extractInvoiceNumber(b.number) - extractInvoiceNumber(a.number));
        break;
      case 'price_asc':
        list = [...list].sort((a, b) => (a.total ?? 0) - (b.total ?? 0));
        break;
      case 'price_desc':
        list = [...list].sort((a, b) => (b.total ?? 0) - (a.total ?? 0));
        break;
    }

    return list;
  }, [invoices, filters]);

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
      <InvoicesFilters value={filters} onChange={setFilters} />

      {/* Table */}
      <InvoiceTable invoices={filteredInvoices} />
    </div>
  );
} 