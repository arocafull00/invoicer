import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  pdf,
  Font,
} from "@react-pdf/renderer";
import type { Invoice } from "@/shared/types";
import { formatDate, formatCurrency } from "@/shared/lib/helpers";
import { useSettingsStore } from "@/shared/lib/stores";

// Registrar fuente Montserrat
Font.register({
  family: "Montserrat",
  fonts: [
    { src: "/fonts/static/Montserrat-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/static/Montserrat-Medium.ttf", fontWeight: 500 },
    { src: "/fonts/static/Montserrat-SemiBold.ttf", fontWeight: 600 },
    { src: "/fonts/static/Montserrat-Bold.ttf", fontWeight: 700 },
  ],
});

// Estilos del PDF
const styles = StyleSheet.create({
  page: {
    fontFamily: "Montserrat",
    fontSize:12,
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 40,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    maxWidth: 180,
    maxHeight: 50,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  invoiceTitle: {
    fontSize: 12,
    color: "#7F5AF0",
  },
  invoiceNumber: {
    fontSize: 12,
    color: "#09090B",
    fontWeight: 600,
  },
  date: {
    fontSize: 12,
    color: "#09090B",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    color: "#7F5AF0",
    marginBottom: 6,
  },
  text: {
    fontSize: 12,
    color: "#09090B",
    marginBottom: 3,
  },
  textLight: {
    fontSize: 12,
    color: "#24242B",
    marginBottom: 3,
  },
  consultantSection: {
    marginBottom: 20,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#24242B",
    marginVertical: 15,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#24242B",
    paddingBottom: 6,
    marginBottom: 8,
  },
  tableHeaderCell: {
    fontSize: 12,
    color: "#7F5AF0",
    fontWeight: 600,
  },
  tableRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  tableCell: {
    fontSize: 12,
    color: "#09090B",
  },
  colDescription: {
    width: "40%",
  },
  colQuantity: {
    width: "15%",
  },
  colRate: {
    width: "22%",
  },
  colTotal: {
    width: "23%",
    textAlign: "right",
  },
  totalsSection: {
    marginTop: 15,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 6,
    gap: 30,
  },
  totalLabel: {
    fontSize: 12,
    color: "#09090B",
    width: 90,
    textAlign: "right",
  },
  totalValue: {
    fontSize: 12,
    color: "#09090B",
    width: 80,
    textAlign: "right",
  },
  totalFinal: {
    borderTopWidth: 1,
    borderTopColor: "#24242B",
    paddingTop: 6,
  },
  totalFinalLabel: {
    fontSize: 12,
    color: "#7F5AF0",
    fontWeight: 700,
    width: 90,
    textAlign: "right",
  },
  totalFinalValue: {
    fontSize: 12,
    color: "#7F5AF0",
    fontWeight: 700,
    width: 80,
    textAlign: "right",
  },
});

interface InvoicePDFDocumentProps {
  invoice: Invoice;
  logoUrl?: string | null;
}

// Componente del documento PDF
const InvoicePDFDocument: React.FC<InvoicePDFDocumentProps> = ({
  invoice,
  logoUrl,
}) => {
  const lineItems =
    invoice.line_items && invoice.line_items.length > 0
      ? invoice.line_items
      : [
          {
            description: invoice.description || "",
            quantity: 1,
            rate: invoice.total,
            total: invoice.total,
          },
        ];

  const subtotal = invoice.subtotal || invoice.total;
  const vatAmount = invoice.vat_amount || 0;
  const total = invoice.total;

  return (
    <Document
      title={`Invoice ${invoice.number}`}
      author={invoice.consultant.name}
      subject={`Invoice for ${invoice.client.name}`}
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {logoUrl ? (
            <Image src={logoUrl} style={styles.logo} />
          ) : (
            <Text style={styles.invoiceTitle}>INVOICE</Text>
          )}
          <View style={styles.headerRight}>
            <Text style={styles.date}>{formatDate(invoice.created_date)}</Text>
            <Text style={styles.invoiceNumber}>N.º {invoice.number}</Text>
          </View>
        </View>

        {/* Consultant Section */}
        <View style={styles.consultantSection}>
          <Text style={styles.text}>{invoice.consultant.name}</Text>
          <Text style={styles.text}>{invoice.consultant.address}</Text>
          <Text style={styles.text}>
            {invoice.consultant.city}, {invoice.consultant.country}
          </Text>
          <Text style={styles.text}>NIF: {invoice.consultant.nif}</Text>
          <Text style={styles.text}>Email: {invoice.consultant.email}</Text>
        </View>

        {/* Client Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client</Text>
          <Text style={styles.text}>{invoice.client.name}</Text>
          {invoice.client.address && (
            <Text style={styles.text}>{invoice.client.address}</Text>
          )}
          <Text style={styles.text}>
            {invoice.client.city}, {invoice.client.country}
          </Text>
          {invoice.client.company_number && (
            <Text style={styles.text}>
              Company Number: {invoice.client.company_number}
            </Text>
          )}
        </View>

        {/* Invoice Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Factura {invoice.number} - {formatDate(invoice.created_date)}
          </Text>
          <Text style={styles.text}>
            Account Holder: {invoice.payment_instructions.account_holder}
          </Text>
          <Text style={styles.text}>
            IBAN: {invoice.payment_instructions.iban}
          </Text>
          <Text style={styles.text}>
            Payment Method: {invoice.payment_instructions.payment_method}
          </Text>
          <Text style={styles.text}>
            {invoice.payment_instructions.payment_terms}
          </Text>
          <Text style={styles.textLight}>
            {invoice.payment_instructions.additional_data}
          </Text>
        </View>

        <View style={styles.separator} />

        {/* Line Items Table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.colDescription]}>
            CONCEPTO
          </Text>
          <Text style={[styles.tableHeaderCell, styles.colQuantity]}>
            HORAS
          </Text>
          <Text style={[styles.tableHeaderCell, styles.colRate]}>
            €/HORA
          </Text>
          <Text style={[styles.tableHeaderCell, styles.colTotal]}>TOTAL</Text>
        </View>

        {lineItems.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.colDescription]}>
              {item.description}
            </Text>
            <Text style={[styles.tableCell, styles.colQuantity]}>
              {item.quantity}
            </Text>
            <Text style={[styles.tableCell, styles.colRate]}>
              {formatCurrency(item.rate)}
            </Text>
            <Text style={[styles.tableCell, styles.colTotal]}>
              {formatCurrency(item.total || item.quantity * item.rate)}
            </Text>
          </View>
        ))}

        <View style={styles.separator} />

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Base imponible</Text>
            <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
          </View>

          {!invoice.vat_exempt && vatAmount > 0 && (
            <>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  IVA ({invoice.vat_rate || 21}%)
                </Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(vatAmount)}
                </Text>
              </View>

              <View style={[styles.totalRow, styles.totalFinal]}>
                <Text style={styles.totalFinalLabel}>TOTAL</Text>
                <Text style={styles.totalFinalValue}>
                  {formatCurrency(total)}
                </Text>
              </View>
            </>
          )}
        </View>
      </Page>
    </Document>
  );
};

/**
 * Genera un PDF de factura con el formato específico
 */
export const createInvoicePDF = async (
  invoice: Invoice
): Promise<Uint8Array> => {
  // Cargar settings para obtener el logo
  const { isLoaded, loading, load } = useSettingsStore.getState();
  if (!isLoaded && !loading) {
    await load();
  }
  const logoUrl = useSettingsStore.getState().settings?.logo_url ?? null;

  // Generar el PDF
  const blob = await pdf(<InvoicePDFDocument invoice={invoice} logoUrl={logoUrl} />).toBlob();

  // Convertir blob a Uint8Array
  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};

/**
 * Descarga el PDF generado
 */
export const downloadInvoicePDF = async (invoice: Invoice): Promise<void> => {
  const pdfBytes = await createInvoicePDF(invoice);
  const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${invoice.client.name}-${invoice.consultant.name}-${invoice.number}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

