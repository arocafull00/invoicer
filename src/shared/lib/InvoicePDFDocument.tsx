import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import type { Invoice } from "@/shared/types";
import { formatDate, formatCurrency } from "@/shared/lib/helpers";
import { InvoicePDFLineItemRow } from "@/shared/lib/InvoicePDFLineItemRow";

const PRIMARY = "#7F5AF0";
const PRIMARY_DARK = "#654DD4";
const TEXT = "#18181B";
const TEXT_MUTED = "#52525B";
const BORDER = "#D4D4D8";
const SURFACE_TINT = "#F4F0FF";
const WHITE = "#FFFFFF";

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
    fontSize: 10,
    paddingTop: 28,
    paddingBottom: 32,
    paddingHorizontal: 40,
    backgroundColor: WHITE,
    color: TEXT,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 22,
  },
  logo: {
    maxWidth: 220,
    maxHeight: 72,
    height: 72,
    width: 72,
    objectFit: "contain",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  invoiceWord: {
    fontSize: 22,
    fontWeight: 700,
    color: PRIMARY,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  invoiceBadge: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  invoiceBadgeText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: 700,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateIcon: {
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: PRIMARY,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: PRIMARY_DARK,
    marginRight: 4,
  },
  dateValue: {
    fontSize: 10,
    color: TEXT,
    fontWeight: 500,
  },
  senderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 20,
  },
  circleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  circleIconGlyph: {
    color: WHITE,
    fontSize: 16,
    fontWeight: 700,
  },
  senderTextBlock: {
    flex: 1,
    gap: 3,
  },
  senderName: {
    fontSize: 11,
    fontWeight: 700,
    color: TEXT,
    marginBottom: 2,
  },
  senderLine: {
    fontSize: 10,
    color: TEXT,
    lineHeight: 1.35,
  },
  senderEmphasis: {
    fontSize: 10,
    fontWeight: 700,
    color: TEXT,
  },
  twoColRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    overflow: "hidden",
  },
  cardTab: {
    backgroundColor: PRIMARY,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cardTabText: {
    color: WHITE,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  cardBody: {
    padding: 12,
  },
  billToBody: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  kvRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  kvLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: TEXT,
    marginRight: 4,
  },
  kvValue: {
    fontSize: 10,
    color: TEXT,
    flex: 1,
  },
  infoBanner: {
    alignItems: "center",
    backgroundColor: SURFACE_TINT,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  infoBannerTextWrap: {
    maxWidth: 470,
  },
  infoBannerText: {
    fontSize: 10,
    color: TEXT_MUTED,
    lineHeight: 1.45,
    textAlign: "center",
  },
  tableHeaderWrap: {
    backgroundColor: PRIMARY,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 700,
    color: WHITE,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  tableBody: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: BORDER,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F4F5",
  },
  tableCell: {
    fontSize: 10,
    color: TEXT,
  },
  tableCellAmount: {
    fontWeight: 700,
  },
  colDescription: {
    width: "38%",
  },
  colQuantity: {
    width: "14%",
    textAlign: "right",
  },
  colRate: {
    width: "24%",
    textAlign: "right",
  },
  colTotal: {
    width: "24%",
    textAlign: "right",
  },
  tableAccentLine: {
    height: 2,
    backgroundColor: PRIMARY,
    marginTop: 4,
    borderRadius: 1,
  },
  totalsWrap: {
    marginTop: 14,
    alignItems: "flex-end",
  },
  totalsInner: {
    width: "52%",
    alignItems: "stretch",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 6,
    gap: 16,
  },
  totalLabel: {
    fontSize: 10,
    color: TEXT_MUTED,
    textAlign: "right",
    flexGrow: 1,
  },
  totalValue: {
    fontSize: 10,
    color: TEXT,
    width: 110,
    textAlign: "right",
    fontWeight: 500,
  },
  totalHighlight: {
    backgroundColor: SURFACE_TINT,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  totalHighlightLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: PRIMARY_DARK,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalHighlightValue: {
    fontSize: 16,
    fontWeight: 700,
    color: PRIMARY,
  },
  placeholderLogo: {
    fontSize: 18,
    fontWeight: 700,
    color: TEXT,
    letterSpacing: 0.5,
  },
});

export interface InvoicePDFDocumentProps {
  invoice: Invoice;
  logoUrl?: string | null;
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

  const bannerPieces = [
    invoice.payment_instructions.payment_terms?.trim(),
    invoice.payment_instructions.additional_data?.trim(),
  ].filter(Boolean);
  const bannerText = bannerPieces.join("\n");

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
      title={`Invoice ${invoice.number}`}
      author={invoice.consultant.name}
      subject={`Invoice for ${invoice.client.name}`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {logoUrl ? (
            <Image src={logoUrl} style={styles.logo} cache={false} />
          ) : (
            <Text style={styles.placeholderLogo}>INVOICE</Text>
          )}
          <View style={styles.headerRight}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.invoiceWord}>Invoice</Text>
              <View style={styles.invoiceBadge}>
                <Text style={styles.invoiceBadgeText}>
                  No. {invoice.number}
                </Text>
              </View>
            </View>
            <View style={styles.dateRow}>
              <View style={styles.dateIcon} />
              <Text style={styles.dateLabel}>Date</Text>
              <Text style={styles.dateValue}>
                {formatDate(invoice.created_date)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.senderRow}>
          <View style={styles.senderTextBlock}>
            <Text style={styles.senderName}>{invoice.consultant.name}</Text>
            <Text style={styles.senderLine}>{invoice.consultant.address}</Text>
            <Text style={styles.senderLine}>
              {invoice.consultant.city}, {invoice.consultant.country}
            </Text>
            <Text style={styles.senderLine}>
              <Text style={styles.senderEmphasis}>VAT / Tax ID: </Text>
              {invoice.consultant.nif}
            </Text>
            <Text style={styles.senderLine}>
              <Text style={styles.senderEmphasis}>Email: </Text>
              {invoice.consultant.email}
            </Text>
          </View>
        </View>

        <View style={styles.twoColRow}>
          <View style={styles.card}>
            <View style={styles.cardTab}>
              <Text style={styles.cardTabText}>Bill to</Text>
            </View>
            <View style={[styles.cardBody, styles.billToBody]}>
              <View style={styles.senderTextBlock}>
                <Text style={styles.senderName}>{invoice.client.name}</Text>
                {invoice.client.address ? (
                  <Text style={styles.senderLine}>{invoice.client.address}</Text>
                ) : null}
                <Text style={styles.senderLine}>
                  {invoice.client.city}, {invoice.client.country}
                </Text>
                {invoice.client.company_number ? (
                  <Text style={styles.senderLine}>
                    <Text style={styles.senderEmphasis}>Company number: </Text>
                    {invoice.client.company_number}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardTab}>
              <Text style={styles.cardTabText}>Payment details</Text>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>Account holder:</Text>
                <Text style={styles.kvValue} wrap>
                  {invoice.payment_instructions.account_holder}
                </Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>IBAN:</Text>
                <Text style={styles.kvValue} wrap>
                  {invoice.payment_instructions.iban}
                </Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>Payment method:</Text>
                <Text style={styles.kvValue} wrap>
                  {invoice.payment_instructions.payment_method}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {bannerText ? (
          <View style={styles.infoBanner} wrap={false}>
            <View style={styles.infoBannerTextWrap}>
              <Text style={styles.infoBannerText}>{bannerText}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.tableHeaderWrap} wrap={false}>
          <Text style={[styles.tableHeaderCell, styles.colDescription]}>
            Description
          </Text>
          <Text style={[styles.tableHeaderCell, styles.colQuantity]}>
            Hours
          </Text>
          <Text style={[styles.tableHeaderCell, styles.colRate]}>
            Rate (EUR)
          </Text>
          <Text style={[styles.tableHeaderCell, styles.colTotal]}>
            Amount (EUR)
          </Text>
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
        <View style={styles.tableAccentLine} />

        <View style={styles.totalsWrap}>
          <View style={styles.totalsInner}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal (excl. VAT)</Text>
              <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
            </View>
            {!invoice.vat_exempt && vatAmount > 0 ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  VAT ({invoice.vat_rate || 21}%)
                </Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(vatAmount)}
                </Text>
              </View>
            ) : null}
            <View style={styles.totalHighlight}>
              <Text style={styles.totalHighlightLabel}>Total</Text>
              <Text style={styles.totalHighlightValue}>
                {formatCurrency(total)}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
