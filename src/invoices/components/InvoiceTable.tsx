import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Edit,
  Trash2,
  Plus,
  FileText,
  Mail,
  SlidersHorizontal,
} from "lucide-react";
import { useInvoiceStore, useSettingsStore } from "@/shared/lib/stores";
import { Spinner } from "@/shared/components/Spinner";
import { formatDate, formatCurrency } from "@/shared/lib/helpers";
import { downloadInvoicePDF } from "@/shared/lib/pdf";
import { getInvoiceEmailContent } from "@/shared/lib/invoiceEmail";
import type { Invoice } from "@/shared/types";
import { updateInvoice, softDeleteInvoice } from "@/shared/api/services/invoices";
import { queryClient } from "@/shared/api/queryClient";
import { InvoiceTableSortHeader } from "@/invoices/components/InvoiceTableSortHeader";
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
  const router = useRouter();
  const { invoices, isDataReady } = useInvoiceStore();
  useSettingsStore((s) => s.settings);
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
    router.push(`/invoices/edit/${invoice.id}`);
  }, [router]);

  const handleView = useCallback((invoice: Invoice) => {
    router.push(`/invoices/view/${invoice.id}`);
  }, [router]);

  const handleOpenGmail = useCallback((invoice: Invoice) => {
    const recipient = invoice.client.email?.trim();
    if (!recipient) {
      toast.error("Añade un email al cliente para preparar el correo en Gmail");
      return;
    }

    const { subject, body } = getInvoiceEmailContent(invoice);
    const params = new URLSearchParams({
      view: "cm",
      fs: "1",
      to: recipient,
      su: subject,
      body,
    });
    window.open(`https://mail.google.com/mail/?${params}`, "_blank", "noopener,noreferrer");
  }, []);

  const [sorting, setSorting] = useState<SortingState>([
    { id: "number", desc: true },
  ]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const handleStatusChange = useCallback(async (
    inv: Invoice,
    next: Invoice["status"]
  ) => {
    if (inv.status === next) return;
    try {
      setUpdatingId(inv.id);
      const updated = await updateInvoice(inv.id, {
        status: next,
      });
      const current = useInvoiceStore.getState().invoices;
      const mapped = current.map((i) => (i.id === updated.id ? updated : i));
      useInvoiceStore.getState().setInvoices(mapped);
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
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
        sortingFn: "alphanumeric",
        header: ({ column }) => (
          <InvoiceTableSortHeader label="NÚMERO" column={column} />
        ),
        cell: ({ row }) => (
          <Link
            href={`/invoices/view/${row.original.id}`}
            className="rounded-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Ver factura ${row.original.number}`}
          >
            {row.original.number}
          </Link>
        ),
      },
      {
        accessorKey: "created_date",
        header: ({ column }) => (
          <InvoiceTableSortHeader label="FECHA" column={column} />
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
          <InvoiceTableSortHeader label="TOTAL" column={column} />
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
              <SelectTrigger
                className="bg-card border-border text-foreground"
                aria-label={`Estado de factura ${row.original.number}`}
              >
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
              onClick={() => handleEdit(row.original)}
              title="Editar"
              aria-label={`Editar factura ${row.original.number}`}
            >
              <Edit className="w-4 h-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-accent p-2"
              onClick={() => handleDownloadPDF(row.original)}
              disabled={loadingPdf === row.original.id}
              title="Descargar"
              aria-label={`Descargar PDF de factura ${row.original.number}`}
            >
              {loadingPdf === row.original.id ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" aria-hidden="true" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-accent p-2"
              onClick={() => handleOpenGmail(row.original)}
              title="Abrir en Gmail"
              aria-label={`Preparar correo en Gmail para la factura ${row.original.number}`}
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-foreground hover:bg-destructive/20 p-2"
              onClick={() => handleDelete(row.original)}
              disabled={deletingId === row.original.id}
              title="Eliminar"
              aria-label={`Eliminar factura ${row.original.number}`}
            >
              {deletingId === row.original.id ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        ),
      },
    ],
    [loadingPdf, updatingId, deletingId, handleEdit, handleOpenGmail, handleStatusChange, handleDelete]
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

  const activeFilterCount = table.getState().columnFilters.length;

  if (!isDataReady) {
    return (
      <Card className="p-6 md:p-12 flex items-center justify-center">
        <Spinner className="h-10 w-10" />
      </Card>
    );
  }

  if (invoices.length === 0) {
    return (
      <Card className="p-6 md:p-12">
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
            <Link href="/invoices/new">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Factura
            </Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-0 md:p-6">
      <div className="p-3 md:p-6">
        <div className="flex flex-col gap-3 mb-4">
          <div className="grid grid-cols-1 gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
            <div className="flex gap-2 min-w-0 sm:col-span-2 lg:col-span-3">
              <Input
                placeholder="Buscar facturas..."
                className="bg-card border-border text-foreground placeholder:text-muted-foreground w-full min-w-0"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
              <Button
                variant="outline"
                className="sm:hidden shrink-0 gap-2"
                onClick={() => setShowFilters((v) => !v)}
                aria-expanded={showFilters}
                aria-label="Mostrar filtros"
              >
                <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>
            <div className={`${showFilters ? "block" : "hidden"} sm:block min-w-0 lg:col-span-3`}>
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
            <div className={`${showFilters ? "block" : "hidden"} sm:block min-w-0 lg:col-span-3`}>
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
            <div className={`${showFilters ? "block" : "hidden"} sm:block min-w-0 lg:col-span-3`}>
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
                  {Array.from(
                    new Set(invoices.map((i) => i.client.name))
                  ).map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
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
                    className="cursor-pointer border-b border-border hover:bg-accent/30 transition-colors"
                    onClick={(event) => {
                      const target = event.target as HTMLElement;
                      if (
                        !event.currentTarget.contains(target) ||
                        target.closest("a, button, [role='combobox']")
                      ) return;
                      handleView(row.original);
                    }}
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
        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
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
