import type { Style } from "@react-pdf/types";
import { Text, View } from "@react-pdf/renderer";
import type { LineItem } from "@/shared/types";
import { formatCurrency } from "@/shared/lib/helpers";

export type InvoicePDFTableStyles = {
  tableRow: Style;
  tableCell: Style;
  tableCellAmount: Style;
  colDescription: Style;
  colQuantity: Style;
  colRate: Style;
  colTotal: Style;
};

type InvoicePDFLineItemRowProps = {
  item: LineItem;
  styles: InvoicePDFTableStyles;
};

export function InvoicePDFLineItemRow({
  item,
  styles: s,
}: InvoicePDFLineItemRowProps) {
  const lineTotal = item.total || item.quantity * item.rate;
  return (
    <View style={s.tableRow}>
      <Text style={[s.tableCell, s.colDescription]}>{item.description}</Text>
      <Text style={[s.tableCell, s.colQuantity]}>{item.quantity}</Text>
      <Text style={[s.tableCell, s.colRate]}>{formatCurrency(item.rate)}</Text>
      <Text style={[s.tableCell, s.tableCellAmount, s.colTotal]}>
        {formatCurrency(lineTotal)}
      </Text>
    </View>
  );
}
