import { pdf } from "@react-pdf/renderer";
import type { Invoice } from "@/shared/types";
import { useSettingsStore } from "@/shared/lib/stores";
import { InvoicePDFDocument } from "@/shared/lib/InvoicePDFDocument";

const convertBlobToPNG = async (blob: Blob): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = document.createElement("img");
    const blobUrl = URL.createObjectURL(blob);

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(blobUrl);
          resolve(null);
          return;
        }

        ctx.drawImage(img, 0, 0);

        const pngBase64 = canvas.toDataURL("image/png");

        URL.revokeObjectURL(blobUrl);
        resolve(pngBase64);
      } catch {
        URL.revokeObjectURL(blobUrl);
        resolve(null);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      resolve(null);
    };

    img.src = blobUrl;
  });
};

const imageUrlToBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      mode: "cors",
      credentials: "omit",
    });

    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();

    const pngBase64 = await convertBlobToPNG(blob);

    return pngBase64;
  } catch {
    return null;
  }
};

export const createInvoicePDF = async (
  invoice: Invoice
): Promise<Uint8Array> => {
  const { isLoaded, loading, load } = useSettingsStore.getState();
  if (!isLoaded && !loading) {
    await load();
  }
  const settings = useSettingsStore.getState().settings;
  const logoUrl = settings?.logo_url ?? null;
  const pdfColorPalette = settings?.pdf_color_palette ?? "violet";

  const logoBase64 = logoUrl ? await imageUrlToBase64(logoUrl) : null;

  const blob = await pdf(
    <InvoicePDFDocument
      invoice={invoice}
      logoUrl={logoBase64}
      colorPalette={pdfColorPalette}
    />
  ).toBlob();

  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};

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
