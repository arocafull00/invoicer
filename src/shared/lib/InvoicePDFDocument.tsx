import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import type { Invoice, PdfColorPalette } from "@/shared/types";
import { formatCurrency } from "@/shared/lib/helpers";
import { InvoicePDFLineItemRow } from "@/shared/lib/InvoicePDFLineItemRow";

const TEXT = "#18181B";
const MUTED = "#71717A";
const BORDER = "#D4D4D8";
const WHITE = "#FFFFFF";
const DARK = "#27272A";

Font.register({
  family: "Montserrat",
  fonts: [
    { src: "/fonts/static/Montserrat-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/static/Montserrat-Medium.ttf", fontWeight: 500 },
    { src: "/fonts/static/Montserrat-SemiBold.ttf", fontWeight: 600 },
    { src: "/fonts/static/Montserrat-Bold.ttf", fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Montserrat",
    fontSize: 9,
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 44,
    backgroundColor: WHITE,
    color: TEXT,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: DARK,
    marginBottom: 22,
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: "contain",
  },
  logoPlaceholder: {
    flexDirection: "column",
  },
  logoSymbol: {
    fontSize: 44,
    fontWeight: 700,
    color: TEXT,
    lineHeight: 1,
  },
  logoName: {
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: TEXT,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  headerDate: {
    fontSize: 9.5,
    color: MUTED,
  },
  headerSep: {
    width: 1,
    height: 52,
    backgroundColor: DARK,
  },
  headerInvoiceBlock: {
    alignItems: "flex-end",
  },
  headerInvoiceLabel: {
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: TEXT,
    marginBottom: 1,
  },
  headerInvoiceNumber: {
    fontSize: 36,
    fontWeight: 700,
    color: TEXT,
    lineHeight: 1.05,
  },
  twoColInfo: {
    flexDirection: "row",
    gap: 28,
    marginBottom: 22,
  },
  infoCol: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 7.5,
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: TEXT,
    marginBottom: 4,
  },
  sectionRule: {
    height: 1.5,
    width: 22,
    backgroundColor: TEXT,
    marginBottom: 10,
  },
  infoName: {
    fontSize: 10,
    fontWeight: 700,
    color: TEXT,
    marginBottom: 3,
  },
  infoLine: {
    fontSize: 9,
    color: TEXT,
    lineHeight: 1.5,
  },
  infoGap: {
    height: 8,
  },
  paymentBox: {
    borderWidth: 1,
    borderColor: DARK,
    marginBottom: 22,
  },
  paymentBoxRow: {
    flexDirection: "row",
  },
  paymentLeft: {
    flex: 1,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  paymentRight: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  paymentSectionLabel: {
    fontSize: 7.5,
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: TEXT,
    marginBottom: 4,
  },
  paymentSectionRule: {
    height: 1.5,
    width: 22,
    backgroundColor: TEXT,
    marginBottom: 10,
  },
  paymentRow: {
    flexDirection: "row",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  paymentFieldLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: TEXT,
    marginRight: 4,
  },
  paymentFieldValue: {
    fontSize: 9,
    color: TEXT,
    flex: 1,
  },
  paymentTerms: {
    fontSize: 9,
    color: TEXT,
    lineHeight: 1.6,
  },
  tableHeader: {
    flexDirection: "row",
    borderTopWidth: 1.5,
    borderTopColor: TEXT,
    borderBottomWidth: 1,
    borderBottomColor: TEXT,
    paddingVertical: 7,
    paddingHorizontal: 4,
  },
  tableHeaderCell: {
    fontSize: 7.5,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: TEXT,
  },
  tableBody: {
    borderBottomWidth: 1,
    borderBottomColor: DARK,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  tableCell: {
    fontSize: 9.5,
    color: TEXT,
  },
  tableCellAmount: {
    fontWeight: 500,
  },
  colDescription: {
    width: "40%",
  },
  colQuantity: {
    width: "18%",
    textAlign: "right",
  },
  colRate: {
    width: "21%",
    textAlign: "right",
  },
  colTotal: {
    width: "21%",
    textAlign: "right",
  },
  totalsWrap: {
    marginTop: 16,
    alignItems: "flex-end",
  },
  totalsInner: {
    width: "44%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  totalLabel: {
    fontSize: 9.5,
    color: TEXT,
  },
  totalValue: {
    fontSize: 9.5,
    color: TEXT,
    textAlign: "right",
  },
  totalDivider: {
    height: 0.75,
    backgroundColor: DARK,
    marginVertical: 2,
  },
  totalFinalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
  },
  totalFinalLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: TEXT,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalFinalValue: {
    fontSize: 14,
    fontWeight: 700,
    color: TEXT,
    textAlign: "right",
  },
});

const formatDateES = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export interface InvoicePDFDocumentProps {
  invoice: Invoice;
  logoUrl?: string | null;
  colorPalette?: PdfColorPalette;
}

export function InvoicePDFDocument({
  invoice,
  logoUrl,
}: InvoicePDFDocumentProps) {
  const lineItems =
    invoice.line_items && invoice.line_items.length > 0
      ? invoice.line_items
      : [
          {
            id: "fallback",
            description: invoice.description || "",
            quantity: 1,
            rate: invoice.total,
            total: invoice.total,
            includeVat: !invoice.vat_exempt,
          },
        ];

  const subtotal = invoice.subtotal || invoice.total;
  const vatAmount = invoice.vat_amount || 0;
  const total = invoice.total;

  const paymentTermsText = [
    invoice.payment_instructions.payment_terms?.trim(),
    invoice.payment_instructions.additional_data?.trim(),
  ]
    .filter(Boolean)
    .join("\n");

  const tableStyles = {
    tableRow: styles.tableRow,
    tableCell: styles.tableCell,
    tableCellAmount: styles.tableCellAmount,
    colDescription: styles.colDescription,
    colQuantity: styles.colQuantity,
    colRate: styles.colRate,
    colTotal: styles.colTotal,
  };

  return (
    <Document
      title={`Factura ${invoice.number}`}
      author={invoice.consultant.name}
      subject={`Factura para ${invoice.client.name}`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {logoUrl ? (
            <Image src={logoUrl} style={styles.logo} cache={false} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoSymbol}>A</Text>
              <Text style={styles.logoName}>{invoice.consultant.name}</Text>
            </View>
          )}
          <View style={styles.headerRight}>
            <Text style={styles.headerDate}>
              {formatDateES(invoice.created_date)}
            </Text>
            <View style={styles.headerSep} />
            <View style={styles.headerInvoiceBlock}>
              <Text style={styles.headerInvoiceLabel}>Factura</Text>
              <Text style={styles.headerInvoiceNumber}>
                Nº {invoice.number}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.twoColInfo}>
          <View style={styles.infoCol}>
            <Text style={styles.sectionLabel}>Emisor</Text>
            <View style={styles.sectionRule} />
            <Text style={styles.infoName}>{invoice.consultant.name}</Text>
            <Text style={styles.infoLine}>{invoice.consultant.address}</Text>
            <Text style={styles.infoLine}>
              {invoice.consultant.city}, {invoice.consultant.country}
            </Text>
            <View style={styles.infoGap} />
            <Text style={styles.infoLine}>NIF: {invoice.consultant.nif}</Text>
            <Text style={styles.infoLine}>
              Email: {invoice.consultant.email}
            </Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.sectionLabel}>Cliente</Text>
            <View style={styles.sectionRule} />
            <Text style={styles.infoName}>{invoice.client.name}</Text>
            {invoice.client.address ? (
              <Text style={styles.infoLine}>{invoice.client.address}</Text>
            ) : null}
            <Text style={styles.infoLine}>
              {invoice.client.city}, {invoice.client.country}
            </Text>
            {invoice.client.company_number ? (
              <View>
                <View style={styles.infoGap} />
                <Text style={styles.infoLine}>
                  Company Number: {invoice.client.company_number}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.paymentBox}>
          <View style={styles.paymentBoxRow}>
            <View style={styles.paymentLeft}>
              <Text style={styles.paymentSectionLabel}>Datos de pago</Text>
              <View style={styles.paymentSectionRule} />
              <View style={styles.paymentRow}>
                <Text style={styles.paymentFieldLabel}>
                  Titular de la cuenta:
                </Text>
                <Text style={styles.paymentFieldValue} wrap>
                  {invoice.payment_instructions.account_holder}
                </Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentFieldLabel}>IBAN:</Text>
                <Text style={styles.paymentFieldValue} wrap>
                  {invoice.payment_instructions.iban}
                </Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentFieldLabel}>Método de pago:</Text>
                <Text style={styles.paymentFieldValue} wrap>
                  {invoice.payment_instructions.payment_method}
                </Text>
              </View>
            </View>
            {paymentTermsText ? (
              <View style={styles.paymentRight}>
                <Text style={styles.paymentTerms}>{paymentTermsText}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.tableHeader} wrap={false}>
          <Text style={[styles.tableHeaderCell, styles.colDescription]}>
            Concepto
          </Text>
          <Text style={[styles.tableHeaderCell, styles.colQuantity]}>
            Unidades
          </Text>
          <Text style={[styles.tableHeaderCell, styles.colRate]}>
            € / Unidad
          </Text>
          <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total</Text>
        </View>
        <View style={styles.tableBody}>
          {lineItems.map((item, index) => (
            <InvoicePDFLineItemRow
              key={item.id || `line-${index}`}
              item={item}
              styles={tableStyles}
            />
          ))}
        </View>

        <View style={styles.totalsWrap}>
          <View style={styles.totalsInner}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Base imponible</Text>
              <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
            </View>
            {!invoice.vat_exempt && vatAmount > 0 ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  IVA ({invoice.vat_rate || 21}%)
                </Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(vatAmount)}
                </Text>
              </View>
            ) : null}
            <View style={styles.totalDivider} />
            <View style={styles.totalFinalRow}>
              <Text style={styles.totalFinalLabel}>Total</Text>
              <Text style={styles.totalFinalValue}>
                {formatCurrency(total)}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
