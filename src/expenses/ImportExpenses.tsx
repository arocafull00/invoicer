import { useEffect, useRef, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FileUp, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { parseGastosCsv } from "@/expenses/lib/csvImport";
import { useImportExpensesStore } from "@/expenses/store/useImportExpensesStore";
import { useExpensesStore } from "@/expenses/store/useExpensesStore";
import { getExpenseTypes } from "@/shared/api/services/expenses";
import { ImportExpensePreviewRow } from "@/expenses/components/ImportExpensePreviewRow";

export default function ImportExpenses() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { setExpenseTypes, setLoaded } = useExpensesStore();
  const {
    rows,
    isImporting,
    progress,
    setRows,
    reset,
    importAll,
  } = useImportExpensesStore();

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  useEffect(() => {
    let cancelled = false;
    const loadTypes = async () => {
      try {
        const types = await getExpenseTypes();
        if (cancelled) return;
        setExpenseTypes(types);
      } catch (error) {
        console.error(error);
      }
    };
    void loadTypes();
    return () => {
      cancelled = true;
    };
  }, [setExpenseTypes]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = parseGastosCsv(text);
      if (parsed.length === 0) {
        toast.error("No se encontraron gastos válidos en el archivo");
        setRows([]);
        return;
      }
      setRows(parsed);
      toast.success(`${parsed.length} gastos listos para importar`);
    } catch {
      toast.error("No se pudo leer el archivo CSV");
    } finally {
      event.target.value = "";
    }
  };

  const handleImport = async () => {
    if (rows.length === 0) {
      toast.error("Carga un archivo CSV primero");
      return;
    }

    try {
      const result = await importAll();
      if (result.failed === 0) {
        setLoaded(false);
        toast.success(`${result.success} gastos importados`);
        navigate("/expenses");
        return;
      }
      toast.error(
        `Importados ${result.success}, con errores ${result.failed}`
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
          <h1 className="text-3xl font-bold text-foreground">Importar gastos</h1>
          <p className="text-muted-foreground mt-1">
            Sube un CSV con el formato de gastos para crear registros en bloque
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/expenses">
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
                Columnas esperadas: Fecha, Nº Factura, Proveedor, Concepto, Base
                imponible, IVA, Total, Tipo de gasto
              </p>
            )}
          </div>

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
                isImporting || rows.length === 0 || importableCount === 0
              }
              onClick={handleImport}
            >
              <FileUp className="w-4 h-4 mr-2" />
              Importar {importableCount > 0 ? importableCount : rows.length}{" "}
              gastos
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
                  <TableHead>Fecha</TableHead>
                  <TableHead>Nº</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Base</TableHead>
                  <TableHead>IVA</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((item) => (
                  <ImportExpensePreviewRow key={item.row.id} item={item} />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
