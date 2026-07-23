import { useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Download,
  Eye,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Plus,
  FileText,
} from "lucide-react";
import { useInvoiceStore } from "@/shared/lib/stores";
import { Spinner } from "@/shared/components/Spinner";
import { formatDate, formatCurrency } from "@/shared/lib/helpers";
import { downloadInvoicePDF } from "@/shared/lib/pdf";
import type { Invoice } from "@/shared/types";
import { updateInvoice, softDeleteInvoice } from "@/shared/api/services/invoices";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Removed badge rendering for status; using editable Select instead

export function InvoiceTable() {
  const navigate = useNavigate();
  const { invoices, isDataReady } = useInvoiceStore();
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null);

  const handleDownloadPDF = async (invoice: Invoice) => {
    setLoadingPdf(invoice.id);
    try {
      await downloadInvoicePDF(invoice);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("No se pudo descargar el PDF");
    } finally {
      setLoadingPdf(null);
    }
  };

  const handleEdit = useCallback((invoice: Invoice) => {
    navigate(`/invoices/edit/${invoice.id}`);
  }, [navigate]);

  const handleView = useCallback((invoice: Invoice) => {
    navigate(`/invoices/view/${invoice.id}`);
  }, [navigate]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleStatusChange = useCallback(async (inv: Invoice, next: Invoice["status"]) => {
    if (inv.status === next) return;
    try {
      setUpdatingId(inv.id);
      const updated = await updateInvoice(inv.id, { status: next });
      const current = useInvoiceStore.getState().invoices;
      const mapped = current.map((i) => (i.id === updated.id ? updated : i));
      useInvoiceStore.getState().setInvoices(mapped);
      toast.success("Estado actualizado");
    } catch (err) {
      console.error("Failed to update invoice status", err);
      toast.error("No se pudo actualizar el estado");
    } finally {
      setUpdatingId(null);
    }
  }, []);

  const handleDelete = useCallback(async (invoice: Invoice) => {
    setConfirmId(invoice.id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!confirmId) return;
    try {
      setDeletingId(confirmId);
      await softDeleteInvoice(confirmId);
      const current = useInvoiceStore.getState().invoices;
      const remaining = current.filter((i) => i.id !== confirmId);
      useInvoiceStore.getState().setInvoices(remaining);
      toast.success("Factura eliminada");
    } catch (err) {
      console.error("Failed to delete invoice", err);
      toast.error("No se pudo eliminar la factura");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  }, [confirmId]);

  const columns = useMemo<ColumnDef<Invoice>[]>(
    () => [
      {
        accessorKey: "number",
        header: ({ column }) => (
          <div
            className="cursor-pointer select-none inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>NÚMERO</span>
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="w-3.5 h-3.5" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="w-3.5 h-3.5" />
            ) : (
              <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
            )}
          </div>
        ),
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.number}</span>
        ),
      },
      {
        accessorKey: "created_date",
        header: ({ column }) => (
          <div
            className="cursor-pointer select-none inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>FECHA</span>
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="w-3.5 h-3.5" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="w-3.5 h-3.5" />
            ) : (
              <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
            )}
          </div>
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDate(row.original.created_date)}
          </span>
        ),
        sortingFn: "datetime",
      },
      {
        id: "consultantName",
        accessorFn: (row) => row.consultant.name,
        header: () => <div>PRESTADOR DEL SERVICIO</div>,
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-foreground">
              {row.original.consultant?.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {row.original.consultant?.email}
            </p>
          </div>
        ),
      },
      {
        id: "clientName",
        accessorFn: (row) => row.client.name,
        header: () => <div>CLIENTE</div>,
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-foreground">{row.original.client.name}</p>
            <p className="text-sm text-muted-foreground">
              {row.original.client.city}, {row.original.client.country}
            </p>
          </div>
        ),
      },
      {
        id: "period",
        header: () => <div>PERÍODO</div>,
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDate(row.original.start_date)} -{" "}
            {formatDate(row.original.end_date)}
          </span>
        ),
      },
      {
        accessorKey: "total",
        header: ({ column }) => (
          <div
            className="cursor-pointer select-none inline-flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>TOTAL</span>
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="w-3.5 h-3.5" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="w-3.5 h-3.5" />
            ) : (
              <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
            )}
          </div>
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">
            {formatCurrency(row.original.total)}
          </span>
        ),
      },
      {
        id: "status",
        accessorFn: (row) => row.status ?? "",
        header: () => <div>ESTADO</div>,
        cell: ({ row }) => (
          <div className="min-w-[140px]">
            <Select
              value={row.original.status}
              onValueChange={(v: string) =>
                handleStatusChange(row.original, v as Invoice["status"]) }
              disabled={updatingId === row.original.id}
            >
              <SelectTrigger className="bg-card border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Pagada</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="overdue">Vencida</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div>ACCIONES</div>,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-accent p-2"
              onClick={() => handleView(row.original)}
              title="Ver"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-accent p-2"
              onClick={() => handleEdit(row.original)}
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-accent p-2"
              onClick={() => handleDownloadPDF(row.original)}
              disabled={loadingPdf === row.original.id}
              title="Descargar"
            >
              {loadingPdf === row.original.id ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-[#EF4444] hover:text-foreground hover:bg-[#EF4444]/20 p-2"
              onClick={() => handleDelete(row.original)}
              disabled={deletingId === row.original.id}
              title="Eliminar"
            >
              {deletingId === row.original.id ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        ),
      },
    ],
    [loadingPdf, updatingId, deletingId, handleEdit, handleView, handleStatusChange, handleDelete]
  );

  const table = useReactTable({
    data: invoices,
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

  if (!isDataReady) {
    return (
      <Card className="p-12 flex items-center justify-center">
        <Spinner className="h-10 w-10" />
      </Card>
    );
  }

  if (invoices.length === 0) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-full bg-muted p-4 text-muted-foreground">
            <FileText className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">No hay facturas</h2>
            <p className="text-muted-foreground mt-1">
              Crea tu primera factura para empezar a facturar
            </p>
          </div>
          <Button asChild>
            <Link to="/invoices/new">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Factura
            </Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex flex-col gap-3 mb-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
            <div className="min-w-0 sm:col-span-2 lg:col-span-3">
              <Input
                placeholder="Buscar en todas las columnas..."
                className="bg-card border-border text-foreground placeholder:text-muted-foreground w-full min-w-0"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </div>
            <div className="min-w-0 lg:col-span-3">
              <Select
                value={
                  (table.getColumn("status")?.getFilterValue() as string) ??
                  "all"
                }
                onValueChange={(v: string) =>
                  table
                    .getColumn("status")
                    ?.setFilterValue(v === "all" ? undefined : v)
                }
              >
                <SelectTrigger className="bg-card border-border text-foreground w-full min-w-0 max-w-full [&_[data-slot=select-value]]:min-w-0">
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
            <div className="min-w-0 lg:col-span-3">
              <Select
                value={
                  (table
                    .getColumn("consultantName")
                    ?.getFilterValue() as string) ?? "all"
                }
                onValueChange={(v: string) =>
                  table
                    .getColumn("consultantName")
                    ?.setFilterValue(v === "all" ? undefined : v)
                }
              >
                <SelectTrigger className="bg-card border-border text-foreground w-full min-w-0 max-w-full [&_[data-slot=select-value]]:min-w-0">
                  <SelectValue placeholder="Prestador del servicio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los prestadores del servicio</SelectItem>
                  {Array.from(
                    new Set(invoices.map((i) => i.consultant?.name ?? ""))
                  ).map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0 lg:col-span-3">
              <Select
                value={
                  (table.getColumn("clientName")?.getFilterValue() as string) ??
                  "all"
                }
                onValueChange={(v: string) =>
                  table
                    .getColumn("clientName")
                    ?.setFilterValue(v === "all" ? undefined : v)
                }
              >
                <SelectTrigger className="bg-card border-border text-foreground w-full min-w-0 max-w-full [&_[data-slot=select-value]]:min-w-0">
                  <SelectValue placeholder="Cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  {invoices.map((i) => (
                    <SelectItem key={i.client.name} value={i.client.name}>
                      {i.client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-b border-border"
                >
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
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No hay facturas que coincidan con los filtros
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
                onValueChange={(v: string) => {
                  const next = Number(v);
                  setPageSize(next);
                  table.setPageSize(next);
                }}
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
      <AlertDialog open={Boolean(confirmId)} onOpenChange={(open) => !open && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar factura</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que quieres eliminar esta factura? Podrás recuperarla desde la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={confirmDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
