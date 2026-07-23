import Link from "next/link";
import { FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpenseTable } from "@/expenses/components/ExpenseTable";

export default function ExpensesScreen() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gastos</h1>
          <p className="text-muted-foreground mt-1">
            Consulta e importa tus gastos desde un CSV
          </p>
        </div>
        <Button asChild>
          <Link href="/expenses/import">
            <FileUp className="w-4 h-4 mr-2" />
            Importar CSV
          </Link>
        </Button>
      </div>

      <ExpenseTable />
    </div>
  );
}
