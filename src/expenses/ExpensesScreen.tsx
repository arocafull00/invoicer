"use client";

import Link from "next/link";
import { FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpenseTable } from "@/expenses/components/ExpenseTable";
import { CreateExpenseDialog } from "@/expenses/components/CreateExpenseDialog";
import { PageHeader } from "@/shared/components/PageHeader";

export default function ExpensesScreen() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Gastos"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="secondary" asChild><Link href="/expenses/import-pdf"><FileUp className="size-4" /> Subir PDF</Link></Button>
            <Button variant="outline" asChild>
              <Link href="/expenses/import">
                <FileUp className="w-4 h-4 sm:mr-2" />
                <span className="sr-only sm:not-sr-only">Importar CSV</span>
              </Link>
            </Button>
            <CreateExpenseDialog />
          </div>
        }
      />

      <ExpenseTable />
    </div>
  );
}
