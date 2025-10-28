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
    alignItems: "flex-start",
    marginBottom: 20,
  },
  logo: {
    maxWidth: 240,
    maxHeight: 80,
    height: 80,
    width: 80,
    objectFit: "contain",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  invoiceTitle: {
    fontSize: 12,
    color: "#09090B",
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
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  sectionTitle: {
    fontSize: 12,
    color: "#09090B",
    marginBottom: 6,
    fontWeight: 700,
  },
  text: {
    fontSize: 12,
    color: "#09090B",
    marginBottom: 3,
  },
  textLight: {
    fontSize: 12,
    color: "#09090B",
    marginBottom: 3,
  },
  consultantSection: {
    marginBottom: 20,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#09090B",
    marginVertical: 15,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#09090B",
    paddingBottom: 6,
    marginBottom: 8,
  },
  tableHeaderCell: {
    fontSize: 12,
    color: "#09090B",
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
    gap: 6,
  },
  totalLabel: {
    fontSize: 12,
    color: "#09090B",
    width: 100,
    textAlign: "right",
  },
  totalValue: {
    fontSize: 12,
    color: "#09090B",
    width: 100,
    textAlign: "right",
  },
  totalFinal: {
    borderTopWidth: 1,
    borderTopColor: "#09090B",
    paddingTop: 6,
  },
  totalFinalLabel: {
    fontSize: 12,
    color: "#09090B",
    fontWeight: 700,
    width: 100,
    textAlign: "right",
  },
  totalFinalValue: {
    fontSize: 12,
    color: "#09090B",
    fontWeight: 700,
    width: 100,
    textAlign: "right",
  },
});

interface InvoicePDFDocumentProps {
  invoice: Invoice;
  logoUrl?: string | null;
}

// Componente del documento PDF
// eslint-disable-next-line react-refresh/only-export-components
const InvoicePDFDocument = ({
  invoice,
  logoUrl,
}: InvoicePDFDocumentProps) => {
  const lineItems =
    invoice.line_items && invoice.line_items.length > 0
      ? invoice.line_items
      : [
          {
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
            <Image src={logoUrl} style={styles.logo} cache={false} />
          ) : (
            <Text style={styles.invoiceTitle}>INVOICE</Text>
          )}
          <View style={styles.headerRight}>
            <Text style={styles.date}>{formatDate(invoice.created_date)}</Text>
            <Text style={styles.invoiceNumber}>Factura nº {invoice.number}</Text>
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
          <Text style={styles.sectionTitle}>Cliente</Text>
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
            Datos de pago
          </Text>
          <Text style={styles.text}>
            Titular de la cuenta: {invoice.payment_instructions.account_holder}
          </Text>
          <Text style={styles.text}>
            IBAN: {invoice.payment_instructions.iban}
          </Text>
          <Text style={styles.text}>
            Método de pago: {invoice.payment_instructions.payment_method}
          </Text>
          <Text style={styles.text}>
            {invoice.payment_instructions.payment_terms}
          </Text>
          <Text style={styles.textLight}>
            {invoice.payment_instructions.additional_data}
          </Text>
        </View>

        {/* Line Items Table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.colDescription]}>
            Concepto
          </Text>
          <Text style={[styles.tableHeaderCell, styles.colQuantity]}>
            Unidades
          </Text>
          <Text style={[styles.tableHeaderCell, styles.colRate]}>
            €/Unidad
          </Text>
          <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total</Text>
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
 * Convierte una imagen blob a PNG usando canvas (para compatibilidad con react-pdf)
 */
const convertBlobToPNG = async (blob: Blob): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = document.createElement("img");
    const blobUrl = URL.createObjectURL(blob);
    
    img.onload = () => {
      try {
        console.log("Image loaded, dimensions:", img.width, "x", img.height);
        
        // Crear canvas con las dimensiones de la imagen
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Dibujar la imagen en el canvas
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          console.error("Could not get canvas context");
          URL.revokeObjectURL(blobUrl);
          resolve(null);
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        
        // Convertir a PNG base64
        const pngBase64 = canvas.toDataURL("image/png");
        console.log("Image converted to PNG, length:", pngBase64.length);
        
        // Limpiar blob URL
        URL.revokeObjectURL(blobUrl);
        resolve(pngBase64);
      } catch (error) {
        console.error("Error converting image to PNG:", error);
        URL.revokeObjectURL(blobUrl);
        resolve(null);
      }
    };
    
    img.onerror = () => {
      console.error("Error loading image");
      URL.revokeObjectURL(blobUrl);
      resolve(null);
    };
    
    img.src = blobUrl;
  });
};

/**
 * Convierte una imagen URL a base64 en formato PNG (compatible con react-pdf)
 */
const imageUrlToBase64 = async (url: string): Promise<string | null> => {
  try {
    console.log("Fetching image from:", url);
    const response = await fetch(url, { 
      cache: "no-store",
      mode: "cors",
      credentials: "omit"
    });
    
    if (!response.ok) {
      console.error("Failed to fetch image:", response.status, response.statusText);
      return null;
    }
    
    const blob = await response.blob();
    console.log("Image blob type:", blob.type, "size:", blob.size);
    
    // Convertir blob a PNG usando canvas
    const pngBase64 = await convertBlobToPNG(blob);
    
    return pngBase64;
  } catch (error) {
    console.error("Error converting image to base64:", error);
    return null;
  }
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
  
  console.log("Logo URL:", logoUrl);
  
  // Convertir logo a base64 si existe
  const logoBase64 = logoUrl ? await imageUrlToBase64(logoUrl) : null;
  
  console.log("Logo Base64 length:", logoBase64?.length);
  console.log("Logo Base64 prefix:", logoBase64?.substring(0, 50));
  
  // Generar el PDF
  const blob = await pdf(<InvoicePDFDocument invoice={invoice} logoUrl={logoBase64} />).toBlob();

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

