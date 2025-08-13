import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { Invoice } from '@/shared/types';
import { formatDate, formatCurrency } from '@/shared/lib/helpers';

/**
 * Genera un PDF de factura con el formato específico
 */
export const createInvoicePDF = async (invoice: Invoice): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();
  
  // Cargar fuentes
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Colores
  const primaryColor = rgb(0.498, 0.353, 0.941); // #7F5AF0
  const textColor = rgb(0.05, 0.05, 0.05); // #0D0D0D
  const lightGray = rgb(0.6, 0.6, 0.6);
  
  let yPosition = height - 50;
  
  // Título principal
  page.drawText('INVOICE', {
    x: 50,
    y: yPosition,
    size: 24,
    font: boldFont,
    color: primaryColor,
  });
  
  // Número de factura (replace № with No. for PDF compatibility)
  const invoiceNumberPdf = invoice.number.replace('№', 'No.');
  page.drawText(invoiceNumberPdf, {
    x: width - 200,
    y: yPosition,
    size: 16,
    font: boldFont,
    color: textColor,
  });
  
  yPosition -= 40;
  
  // Fecha de la factura
  page.drawText(formatDate(invoice.created_date), {
    x: width - 200,
    y: yPosition,
    size: 12,
    font: font,
    color: textColor,
  });
  
  yPosition -= 60;
  
  // Sección Consultant
  page.drawText('Consultant', {
    x: 50,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: primaryColor,
  });
  
  yPosition -= 25;
  
  page.drawText(invoice.consultant.name, {
    x: 50,
    y: yPosition,
    size: 12,
    font: font,
    color: textColor,
  });
  
  yPosition -= 20;
  
  page.drawText(invoice.consultant.address, {
    x: 50,
    y: yPosition,
    size: 10,
    font: font,
    color: textColor,
  });
  
  yPosition -= 15;
  
  page.drawText(`${invoice.consultant.city}, ${invoice.consultant.country}`, {
    x: 50,
    y: yPosition,
    size: 10,
    font: font,
    color: textColor,
  });
  
  yPosition -= 15;
  
  page.drawText(`NIF: ${invoice.consultant.nif}`, {
    x: 50,
    y: yPosition,
    size: 10,
    font: font,
    color: textColor,
  });
  
  yPosition -= 15;
  
  page.drawText(`Email: ${invoice.consultant.email}`, {
    x: 50,
    y: yPosition,
    size: 10,
    font: font,
    color: textColor,
  });
  
  yPosition -= 40;
  
  // Sección Client
  page.drawText('Client', {
    x: 50,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: primaryColor,
  });
  
  yPosition -= 25;
  
  page.drawText(invoice.client.name, {
    x: 50,
    y: yPosition,
    size: 12,
    font: font,
    color: textColor,
  });
  
  yPosition -= 20;
  
  page.drawText(invoice.client.address, {
    x: 50,
    y: yPosition,
    size: 10,
    font: font,
    color: textColor,
  });
  
  yPosition -= 15;
  
  page.drawText(`${invoice.client.city}, ${invoice.client.country}`, {
    x: 50,
    y: yPosition,
    size: 10,
    font: font,
    color: textColor,
  });
  
  if (invoice.client.company_number) {
    yPosition -= 15;
    page.drawText(`Company Number: ${invoice.client.company_number}`, {
      x: 50,
      y: yPosition,
      size: 10,
      font: font,
      color: textColor,
    });
  }
  
  yPosition -= 40;
  
  // Sección Payment Instructions
  page.drawText('Payment Instructions', {
    x: 50,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: primaryColor,
  });
  
  yPosition -= 25;
  
  page.drawText(`Account Holder: ${invoice.payment_instructions.account_holder}`, {
    x: 50,
    y: yPosition,
    size: 10,
    font: font,
    color: textColor,
  });
  
  yPosition -= 15;
  
  page.drawText(`IBAN: ${invoice.payment_instructions.iban}`, {
    x: 50,
    y: yPosition,
    size: 10,
    font: font,
    color: textColor,
  });
  
  yPosition -= 15;
  
  page.drawText(`Payment Method: ${invoice.payment_instructions.payment_method}`, {
    x: 50,
    y: yPosition,
    size: 10,
    font: font,
    color: textColor,
  });
  
  yPosition -= 15;
  
  page.drawText(invoice.payment_instructions.payment_terms, {
    x: 50,
    y: yPosition,
    size: 10,
    font: font,
    color: textColor,
  });
  
  yPosition -= 20;
  
  page.drawText(invoice.payment_instructions.additional_data, {
    x: 50,
    y: yPosition,
    size: 8,
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
  
  // Descripción y Total
  page.drawText('DESCRIPTION', {
    x: 50,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: primaryColor,
  });
  
  page.drawText('TOTAL', {
    x: width - 150,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: primaryColor,
  });
  
  yPosition -= 25;
  
  page.drawText(invoice.description, {
    x: 50,
    y: yPosition,
    size: 12,
    font: font,
    color: textColor,
    maxWidth: width - 200,
  });
  
  page.drawText(formatCurrency(invoice.total), {
    x: width - 150,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: textColor,
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
  page.drawText('Subtotal', {
    x: width - 200,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: textColor,
  });
  
  page.drawText(formatCurrency(invoice.total), {
    x: width - 150,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: textColor,
  });
  
  return await pdfDoc.save();
};

/**
 * Descarga el PDF generado
 */
export const downloadInvoicePDF = async (invoice: Invoice): Promise<void> => {
  const pdfBytes = await createInvoicePDF(invoice);
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${invoice.number.replace(/\s+/g, '_')}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}; 