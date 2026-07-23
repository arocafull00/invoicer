import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { Column } from "@tanstack/react-table";

type InvoiceTableSortHeaderProps<T> = {
  label: string;
  column: Column<T, unknown>;
};

export function InvoiceTableSortHeader<T>({
  label,
  column,
}: InvoiceTableSortHeaderProps<T>) {
  const sorted = column.getIsSorted();
  const ariaSort =
    sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none";

  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 cursor-pointer select-none text-left"
      onClick={() => column.toggleSorting(sorted === "asc")}
      aria-sort={ariaSort}
    >
      <span>{label}</span>
      {sorted === "asc" ? (
        <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
      ) : sorted === "desc" ? (
        <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
      ) : (
        <ArrowUpDown className="w-3.5 h-3.5 opacity-60" aria-hidden="true" />
      )}
    </button>
  );
}
