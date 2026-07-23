import { useEffect, useRef, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileUp, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInvoiceStore } from "@/shared/lib/stores";
import { parseIngresosCsv } from "@/invoices/lib/csvImport";
import { useImportInvoicesStore } from "@/invoices/store/useImportInvoicesStore";
import { ImportPreviewRow } from "@/invoices/components/ImportPreviewRow";
import { ConsultantSelectOption } from "@/invoices/components/ConsultantSelectOption";

export default function ImportInvoices() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { consultants } = useInvoiceStore();
  const {
    rows,
    selectedConsultantId,
    isImporting,
    progress,
    setRows,
    setSelectedConsultantId,
    reset,
    importAll,
  } = useImportInvoicesStore();

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  useEffect(() => {
    if (selectedConsultantId) return;
    if (consultants.length === 1) {
      setSelectedConsultantId(consultants[0].id);
    }
  }, [consultants, selectedConsultantId, setSelectedConsultantId]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = parseIngresosCsv(text);
      if (parsed.length === 0) {
        toast.error("No se encontraron facturas válidas en el archivo");
        setRows([]);
        return;
      }
      setRows(parsed);
      toast.success(`${parsed.length} facturas listas para importar`);
    } catch {
      toast.error("No se pudo leer el archivo CSV");
    } finally {
      event.target.value = "";
    }
  };

  const handleImport = async () => {
    if (!selectedConsultantId) {
      toast.error("Selecciona un consultor");
      return;
    }
    if (rows.length === 0) {
      toast.error("Carga un archivo CSV primero");
      return;
    }

    try {
      const result = await importAll();
      if (result.failed === 0) {
        toast.success(`${result.success} facturas importadas`);
        router.push("/invoices");
        return;
      }
      toast.error(
        `Importadas ${result.success}, con errores ${result.failed}`
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al importar";
      toast.error(message);
    }
  };

  const importableCount = rows.filter(
    (item) => item.status === "pending" || item.status === "error"
  ).length;
  const successCount = rows.filter((item) => item.status === "success").length;
  const errorCount = rows.filter((item) => item.status === "error").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Importar facturas</h1>
          <p className="text-muted-foreground mt-1">
            Sube un CSV con el formato de ingresos para crear facturas en bloque
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/invoices">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Archivo CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <Button
              type="button"
              variant="secondary"
              disabled={isImporting}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Seleccionar CSV
            </Button>
            {rows.length > 0 ? (
              <p className="text-sm text-muted-foreground">
                {rows.length} filas detectadas
                {successCount > 0 || errorCount > 0
                  ? ` · ${successCount} ok · ${errorCount} error`
                  : null}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Columnas esperadas: Nº Factura, Fecha Servicio, Concepto, Cliente,
                Precio, IRPF, Total cobro, Forma de pago
              </p>
            )}
          </div>

          {consultants.length > 1 ? (
            <div className="space-y-2 max-w-md">
              <label className="text-sm text-muted-foreground">
                Consultor para todas las facturas
              </label>
              <Select
                value={selectedConsultantId}
                onValueChange={setSelectedConsultantId}
                disabled={isImporting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un consultor" />
                </SelectTrigger>
                <SelectContent>
                  {consultants.map((consultant) => (
                    <ConsultantSelectOption
                      key={consultant.id}
                      consultant={consultant}
                    />
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {isImporting ? (
            <div className="space-y-2">
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Importando... {progress}%
              </p>
            </div>
          ) : null}

          <div className="flex gap-3">
            <Button
              type="button"
              disabled={
                isImporting ||
                rows.length === 0 ||
                !selectedConsultantId ||
                importableCount === 0
              }
              onClick={handleImport}
            >
              <FileUp className="w-4 h-4 mr-2" />
              Importar {importableCount > 0 ? importableCount : rows.length}{" "}
              facturas
            </Button>
          </div>
        </CardContent>
      </Card>

      {rows.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Previsualización</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>IRPF</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((item) => (
                  <ImportPreviewRow key={item.row.id} item={item} />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
