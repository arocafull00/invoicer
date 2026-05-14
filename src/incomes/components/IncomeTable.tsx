import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Spinner } from "@/shared/components/Spinner";
import { formatDate, formatCurrency } from "@/shared/lib/helpers";
import type { Income } from "@/shared/types";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Efectivo",
  transfer: "Transferencia",
  bizum: "Bizum",
};

type Props = {
  incomes: Income[];
  isLoading: boolean;
  onEdit: (income: Income) => void;
  onDelete: (id: string) => void;
};

function SortHeader({
  label,
  sorted,
  onToggle,
}: {
  label: string;
  sorted: "asc" | "desc" | false;
  onToggle: (desc: boolean) => void;
}) {
  return (
    <div
      className="cursor-pointer select-none inline-flex items-center gap-1"
      onClick={() => onToggle(sorted === "asc")}
    >
      <span>{label}</span>
      {sorted === "asc" ? (
        <ArrowUp className="w-3.5 h-3.5" />
      ) : sorted === "desc" ? (
        <ArrowDown className="w-3.5 h-3.5" />
      ) : (
        <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
      )}
    </div>
  );
}

export function IncomeTable({ incomes, isLoading, onEdit, onDelete }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);

  const columns = useMemo<ColumnDef<Income>[]>(
    () => [
      {
        accessorKey: "date",
        header: ({ column }) => (
          <SortHeader
            label="FECHA"
            sorted={column.getIsSorted()}
            onToggle={(desc) => column.toggleSorting(desc)}
          />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDate(row.original.date)}
          </span>
        ),
        sortingFn: "datetime",
      },
      {
        accessorKey: "concept",
        header: ({ column }) => (
          <SortHeader
            label="CONCEPTO"
            sorted={column.getIsSorted()}
            onToggle={(desc) => column.toggleSorting(desc)}
          />
        ),
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.concept}
          </span>
        ),
      },
      {
        id: "clientName",
        accessorFn: (row) => row.client?.name ?? "",
        header: ({ column }) => (
          <SortHeader
            label="CLIENTE"
            sorted={column.getIsSorted()}
            onToggle={(desc) => column.toggleSorting(desc)}
          />
        ),
        cell: ({ row }) => (
          <span className="text-foreground">
            {row.original.client?.name ?? "-"}
          </span>
        ),
      },
      {
        accessorKey: "payment_method",
        header: ({ column }) => (
          <SortHeader
            label="FORMA DE PAGO"
            sorted={column.getIsSorted()}
            onToggle={(desc) => column.toggleSorting(desc)}
          />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {PAYMENT_METHOD_LABELS[row.original.payment_method] ??
              row.original.payment_method}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <SortHeader
            label="IMPORTE"
            sorted={column.getIsSorted()}
            onToggle={(desc) => column.toggleSorting(desc)}
          />
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">
            {formatCurrency(row.original.amount)}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <div>ACCIONES</div>,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(row.original)}
            >
              <Pencil className="size-4" />
              Editar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(row.original.id)}
            >
              <Trash2 className="size-4" />
              Eliminar
            </Button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete]
  );

  const table = useReactTable({
    data: incomes,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  if (table.getState().pagination.pageSize !== pageSize) {
    table.setPageSize(pageSize);
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center">
          <Input
            placeholder="Buscar por concepto, cliente, fecha, importe o forma de pago..."
            className="bg-card border-border text-foreground placeholder:text-muted-foreground flex-1"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
          <div className="min-w-[180px]">
            <Select
              value={
                (table
                  .getColumn("payment_method")
                  ?.getFilterValue() as string) ?? "all"
              }
              onValueChange={(v) =>
                table
                  .getColumn("payment_method")
                  ?.setFilterValue(v === "all" ? undefined : v)
              }
            >
              <SelectTrigger className="bg-card border-border text-foreground">
                <SelectValue placeholder="Forma de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las formas de pago</SelectItem>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="transfer">Transferencia</SelectItem>
                <SelectItem value="bizum">Bizum</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b border-border">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-left py-4 px-2 text-sm font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow className="border-b border-border">
                  <TableCell className="py-6 px-2" colSpan={columns.length}>
                    <div className="flex justify-center py-2">
                      <Spinner />
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow className="border-b border-border">
                  <TableCell className="py-6 px-2" colSpan={columns.length}>
                    No hay ingresos
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-b border-border hover:bg-accent/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4 px-2">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filas por página</span>
            <div className="w-24">
              <Select
                value={String(pageSize)}
                onValueChange={(v) => setPageSize(Number(v))}
              >
                <SelectTrigger className="bg-card border-border text-foreground h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount() || 1}
            </span>
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
