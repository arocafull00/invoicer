import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { Invoice } from "@/shared/types";
import { formatDate, formatCurrency } from "@/shared/lib/helpers";
import { useSettingsStore } from "@/shared/lib/stores";

// Convierte cualquier imagen (e.g. WEBP/SVG/GIF) a PNG usando un canvas
const tryLoadFontBytes = async (url: string): Promise<Uint8Array | null> => {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    const ab = await response.arrayBuffer();
    return new Uint8Array(ab);
  } catch {
    return null;
  }
};
const convertImageBlobToPngArrayBuffer = async (
  blob: Blob
): Promise<ArrayBuffer> => {
  // Intentar con createImageBitmap si está disponible
  if ("createImageBitmap" in window) {
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context not available");
    ctx.drawImage(bitmap, 0, 0);
    return await new Promise<ArrayBuffer>((resolve, reject) => {
      canvas.toBlob(
        async (pngBlob) => {
          if (!pngBlob) return reject(new Error("PNG conversion failed"));
          try {
            const ab = await pngBlob.arrayBuffer();
            resolve(ab);
          } catch (err) {
            reject(err);
          }
        },
        "image/png"
      );
    });
  }

  // Fallback a cargar la imagen en un elemento <img>
  const objectUrl = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Image decode failed"));
      el.src = objectUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context not available");
    ctx.drawImage(img, 0, 0);
    return await new Promise<ArrayBuffer>((resolve, reject) => {
      canvas.toBlob(
        async (pngBlob) => {
          if (!pngBlob) return reject(new Error("PNG conversion failed"));
          try {
            const ab = await pngBlob.arrayBuffer();
            resolve(ab);
          } catch (err) {
            reject(err);
          }
        },
        "image/png"
      );
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

/**
 * Genera un PDF de factura con el formato específico
 */
export const createInvoicePDF = async (
  invoice: Invoice
): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();

  // Cargar fuentes
  // Forzar Montserrat Regular (estático) para evitar apariencia demasiado fina
  const desiredFontPath = "/fonts/static/Montserrat-Regular.ttf";
  let font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const montserratBytes = await tryLoadFontBytes(desiredFontPath);
  if (montserratBytes) {
    try {
      font = await pdfDoc.embedFont(montserratBytes);
    } catch {
      // fallback ya es Helvetica
    }
  }
  // Mismo peso y tamaño para todos los textos (títulos solo cambian de color)
  const boldFont = font;
  const BASE_FONT_SIZE = 12;

  // Colores
  const primaryColor = rgb(0.498, 0.353, 0.941); // #7F5AF0
  const textColor = rgb(9 / 255, 9 / 255, 11 / 255);
  const lightGray = rgb(36 / 255, 36 / 255, 43 / 255);

  let yPosition = height - 50;

  let headerCenterY = yPosition - 20;
  let headerBlockHeight = 60;

  try {
    const { isLoaded, loading, load } = useSettingsStore.getState();
    if (!isLoaded && !loading) {
      await load();
    }
    const logoUrl = useSettingsStore.getState().settings?.logo_url ?? null;
    if (logoUrl) {
      const response = await fetch(logoUrl, { cache: "no-store" });
      if (!response.ok) throw new Error(`Failed to fetch logo: ${response.status}`);
      const contentType = (response.headers.get("content-type") || "")
        .split(";")[0]
        .toLowerCase();
      const blob = await response.blob();
      let logoImage;
      try {
        if (contentType.includes("png")) {
          const ab = await blob.arrayBuffer();
          logoImage = await pdfDoc.embedPng(ab);
        } else if (contentType.includes("jpeg") || contentType.includes("jpg")) {
          const ab = await blob.arrayBuffer();
          logoImage = await pdfDoc.embedJpg(ab);
        } else {
          // Convertir a PNG si el formato no es soportado por pdf-lib (ej. WEBP/SVG)
          const pngAb = await convertImageBlobToPngArrayBuffer(blob);
          logoImage = await pdfDoc.embedPng(pngAb);
        }
      } catch {
        // Último recurso: intentar embed como PNG y luego JPG con los bytes crudos
        const fallbackAb = await blob.arrayBuffer();
        try {
          logoImage = await pdfDoc.embedPng(fallbackAb);
        } catch {
          logoImage = await pdfDoc.embedJpg(fallbackAb);
        }
      }
      const { width: imgW, height: imgH } = logoImage;
      const maxW = 240;
      const maxH = 80;
      const scale = Math.min(maxW / imgW, maxH / imgH, 1);
      const drawW = imgW * scale;
      const drawH = imgH * scale;
      page.drawImage(logoImage, {
        x: 50,
        y: yPosition - drawH + 5,
        width: drawW,
        height: drawH,
      });

      // Base de alineación: centro vertical del logo
      headerCenterY = yPosition - drawH / 2 + 5;
      headerBlockHeight = drawH;
    } else {
      page.drawText("INVOICE", {
        x: 50,
        y: yPosition,
        size: BASE_FONT_SIZE,
        font: font,
        color: primaryColor,
      });

      // Alinear con el centro del texto base
      headerCenterY = yPosition - BASE_FONT_SIZE / 2;
      headerBlockHeight = BASE_FONT_SIZE * 1.5;
    }
  } catch (e) {
    console.error(e);
    page.drawText("INVOICE", {
      x: 50,
      y: yPosition,
      size: BASE_FONT_SIZE,
      font: font,
      color: primaryColor,
    });
    // Fallback: estimación de altura del header cuando hay error de logo
    headerCenterY = yPosition - BASE_FONT_SIZE / 2;
    headerBlockHeight = BASE_FONT_SIZE * 1.5;
  }

  // Colocar número de factura y fecha alineados al centro vertical del logo/título
  const invoiceNumberText = `N.º ${invoice.number}`;
  const invoiceNumberFontSize = BASE_FONT_SIZE;
  const dateText = formatDate(invoice.created_date);
  const dateFontSize = BASE_FONT_SIZE;

  const invoiceNumberTextWidth = boldFont.widthOfTextAtSize(
    invoiceNumberText,
    invoiceNumberFontSize
  );
  const dateTextWidth = font.widthOfTextAtSize(dateText, dateFontSize);

  const rightMargin = 50;
  const gapBetweenDateAndNumber = 20;

  const numberX = width - rightMargin - invoiceNumberTextWidth;
  const dateX = numberX - gapBetweenDateAndNumber - dateTextWidth;

  const numberY = headerCenterY - invoiceNumberFontSize / 2;
  const dateY = headerCenterY - dateFontSize / 2;

  page.drawText(invoiceNumberText, {
    x: numberX,
    y: numberY,
    size: invoiceNumberFontSize,
    font: boldFont,
    color: textColor,
  });

  page.drawText(dateText, {
    x: dateX,
    y: dateY,
    size: dateFontSize,
    font: font,
    color: textColor,
  });

  // Avanzar por debajo del bloque de cabecera
  yPosition -= Math.max(headerBlockHeight, 60) + 40;

  // Sección Consultant
  page.drawText("Consultant", {
    x: 50,
    y: yPosition,
    size: BASE_FONT_SIZE,
    font: font,
    color: primaryColor,
  });

  yPosition -= 25;

  page.drawText(invoice.consultant.name, {
    x: 50,
    y: yPosition,
    size: BASE_FONT_SIZE,
    font: font,
    color: textColor,
  });

  yPosition -= 20;

  page.drawText(invoice.consultant.address, {
    x: 50,
    y: yPosition,
    size: BASE_FONT_SIZE,
    font: font,
    color: textColor,
  });

  yPosition -= 15;

  page.drawText(`${invoice.consultant.city}, ${invoice.consultant.country}`, {
    x: 50,
    y: yPosition,
    size: BASE_FONT_SIZE,
    font: font,
    color: textColor,
  });

  yPosition -= 15;

  page.drawText(`NIF: ${invoice.consultant.nif}`, {
    x: 50,
    y: yPosition,
    size: BASE_FONT_SIZE,
    font: font,
    color: textColor,
  });

  yPosition -= 15;

  page.drawText(`Email: ${invoice.consultant.email}`, {
    x: 50,
    y: yPosition,
    size: BASE_FONT_SIZE,
    font: font,
    color: textColor,
  });

  yPosition -= 40;

  // Sección Client
  page.drawText("Client", {
    x: 50,
    y: yPosition,
    size: BASE_FONT_SIZE,
    font: font,
    color: primaryColor,
  });

  yPosition -= 25;

  page.drawText(invoice.client.name, {
    x: 50,
    y: yPosition,
    size: BASE_FONT_SIZE,
    font: font,
    color: textColor,
  });

  yPosition -= 20;

  page.drawText(invoice?.client?.address ?? "", {
    x: 50,
    y: yPosition,
    size: BASE_FONT_SIZE,
    font: font,
    color: textColor,
  });

  yPosition -= 15;

  page.drawText(`${invoice.client.city}, ${invoice.client.country}`, {
    x: 50,
    y: yPosition,
    size: BASE_FONT_SIZE,
    font: font,
    color: textColor,
  });

  if (invoice.client.company_number) {
    yPosition -= 15;
    page.drawText(`Company Number: ${invoice.client.company_number}`, {
      x: 50,
      y: yPosition,
      size: BASE_FONT_SIZE,
      font: font,
      color: textColor,
    });
  }

  yPosition -= 40;

  // Sección Payment Instructions
  page.drawText("Payment Instructions", {
    x: 50,
    y: yPosition,
    size: BASE_FONT_SIZE,
    font: font,
    color: primaryColor,
  });

  yPosition -= 25;

  page.drawText(
    `Account Holder: ${invoice.payment_instructions.account_holder}`,
    {
      x: 50,
      y: yPosition,
      size: BASE_FONT_SIZE,
      font: font,
      color: textColor,
    }
  );

  yPosition -= 15;

  page.drawText(`IBAN: ${invoice.payment_instructions.iban}`, {
    x: 50,
    y: yPosition,
    size: BASE_FONT_SIZE,
    font: font,
    color: textColor,
  });

  yPosition -= 15;

  page.drawText(
    `Payment Method: ${invoice.payment_instructions.payment_method}`,
    {
      x: 50,
      y: yPosition,
      size: BASE_FONT_SIZE,
      font: font,
      color: textColor,
    }
  );

  yPosition -= 15;

  page.drawText(invoice.payment_instructions.payment_terms, {
    x: 50,
    y: yPosition,
    size: BASE_FONT_SIZE,
    font: font,
    color: textColor,
  });

  yPosition -= 20;

  page.drawText(invoice.payment_instructions.additional_data, {
    x: 50,
    y: yPosition,
    size: BASE_FONT_SIZE,
    font: font,
    color: lightGray,
    maxWidth: width - 100,
  });

  yPosition -= 60;

  // Línea separadora
  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: width - 50, y: yPosition },
    thickness: 1,
    color: lightGray,
  });

  yPosition -= 30;

  // Line Items Table Header
  page.drawText("DESCRIPTION", {
    x: 50,
    y: yPosition,
    size: BASE_FONT_SIZE,
    font: font,
    color: primaryColor,
  });

  page.drawText("QTY", {
    x: width - 300,
    y: yPosition,
    size: BASE_FONT_SIZE,
    font: font,
    color: primaryColor,
  });

  page.drawText("RATE", {
    x: width - 220,
    y: yPosition,
    size: BASE_FONT_SIZE,
    font: font,
    color: primaryColor,
  });

  page.drawText("TOTAL", {
    x: width - 150,
    y: yPosition,
    size: BASE_FONT_SIZE,
    font: font,
    color: primaryColor,
  });

  yPosition -= 25;

  // Line Items
  const lineItems = invoice.line_items && invoice.line_items.length > 0 
    ? invoice.line_items 
    : [{ description: invoice.description || "", quantity: 1, rate: invoice.total, total: invoice.total }];

  lineItems.forEach((item) => {
    page.drawText(item.description, {
      x: 50,
      y: yPosition,
      size: BASE_FONT_SIZE,
      font: font,
      color: textColor,
      maxWidth: width - 380,
    });

    page.drawText(item.quantity.toString(), {
      x: width - 300,
      y: yPosition,
      size: BASE_FONT_SIZE,
      font: font,
      color: textColor,
    });

    page.drawText(formatCurrency(item.rate), {
      x: width - 220,
      y: yPosition,
      size: BASE_FONT_SIZE,
      font: font,
      color: textColor,
    });

    page.drawText(formatCurrency(item.total || item.quantity * item.rate), {
      x: width - 150,
      y: yPosition,
      size: BASE_FONT_SIZE,
      font: font,
      color: textColor,
    });

    yPosition -= 20;
  });

  yPosition -= 40;

  // Línea separadora final
  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: width - 50, y: yPosition },
    thickness: 1,
    color: lightGray,
  });

  yPosition -= 30;

  // Subtotal
  page.drawText("Subtotal", {
    x: width - 260,
    y: yPosition,
    size: BASE_FONT_SIZE,
    font: font,
    color: textColor,
  });

  page.drawText(formatCurrency(invoice.total), {
    x: width - 150,
    y: yPosition,
    size: BASE_FONT_SIZE,
    font: font,
    color: textColor,
  });

  return await pdfDoc.save();
};

/**
 * Descarga el PDF generado
 */
export const downloadInvoicePDF = async (invoice: Invoice): Promise<void> => {
  const pdfBytes = await createInvoicePDF(invoice);
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${invoice.client.name}-${invoice.consultant.name}-${invoice.number}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
