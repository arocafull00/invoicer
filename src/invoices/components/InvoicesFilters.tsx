import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/shared/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/select";
import { DatePicker } from "@/shared/components/DatePicker";
import { useInvoiceStore } from "@/shared/lib/stores";

export type InvoiceFiltersState = {
  search: string;
  consultantId: string | "all";
  clientId: string | "all";
  periodStart: string | null;
  periodEnd: string | null;
  status: "all" | "paid" | "pending" | "overdue";
  sort: "number_asc" | "number_desc" | "price_asc" | "price_desc";
};

type InvoicesFiltersProps = {
  value: InvoiceFiltersState;
  onChange: (next: InvoiceFiltersState) => void;
};

export const InvoicesFilters: React.FC<InvoicesFiltersProps> = ({
  value,
  onChange,
}) => {
  const { consultants, clients } = useInvoiceStore();

  const set = (patch: Partial<InvoiceFiltersState>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número, descripción, consultor o cliente"
            className="pl-10 bg-card border-[#FFFFFF14] text-white placeholder:text-[#A1A1AA]"
            value={value.search}
            onChange={(e) => set({ search: e.target.value })}
          />
        </div>

        <div className="w-56">
          <Select
            value={value.consultantId}
            onValueChange={(v) =>
              set({ consultantId: v as InvoiceFiltersState["consultantId"] })
            }
          >
            <SelectTrigger className="bg-card border-[#FFFFFF14] text-white">
              <SelectValue placeholder="Consultor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los consultores</SelectItem>
              {consultants.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-56">
          <Select
            value={value.clientId}
            onValueChange={(v) =>
              set({ clientId: v as InvoiceFiltersState["clientId"] })
            }
          >
            <SelectTrigger className="bg-card border-[#FFFFFF14] text-white">
              <SelectValue placeholder="Cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los clientes</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#A1A1AA]">Periodo</span>
          <div className="w-44">
            <DatePicker
              value={value.periodStart ?? ""}
              onChange={(date) => set({ periodStart: date || null })}
              placeholder="Desde"
            />
          </div>
          <span className="text-[#A1A1AA]">—</span>
          <div className="w-44">
            <DatePicker
              value={value.periodEnd ?? ""}
              onChange={(date) => set({ periodEnd: date || null })}
              placeholder="Hasta"
            />
          </div>
        </div>

        <div className="w-44">
          <Select
            value={value.status}
            onValueChange={(v) =>
              set({ status: v as InvoiceFiltersState["status"] })
            }
          >
            <SelectTrigger className="bg-card border-[#FFFFFF14] text-white">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="paid">Pagada</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="overdue">Vencida</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-56">
          <Select
            value={value.sort}
            onValueChange={(v) =>
              set({ sort: v as InvoiceFiltersState["sort"] })
            }
          >
            <SelectTrigger className="bg-card border-[#FFFFFF14] text-white">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="number_desc">Número: mayor a menor</SelectItem>
              <SelectItem value="number_asc">Número: menor a mayor</SelectItem>
              <SelectItem value="price_desc">Precio: de más a menos</SelectItem>
              <SelectItem value="price_asc">Precio: de menos a más</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default InvoicesFilters;
