import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Invoice } from '../types';
import { formatDate, formatCurrency } from './helpers';

/**
 * Genera un PDF de factura
 */
export const createInvoicePDF = async (invoice: Invoice): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();
  
  // Cargar fuente
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Colores
  const primaryColor = rgb(0.498, 0.353, 0.941); // #7F5AF0
  const textColor = rgb(1, 1, 1); // White
  const darkColor = rgb(0.05, 0.05, 0.05); // #0D0D0D
  
  // Fondo oscuro
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: darkColor,
  });
  
  // Título
  page.drawText('FACTURA', {
    x: 50,
    y: height - 80,
    size: 32,
    font: boldFont,
    color: primaryColor,
  });
  
  // Número de factura
  page.drawText(`Nº: ${invoice.number}`, {
    x: 50,
    y: height - 120,
    size: 16,
    font: font,
    color: textColor,
  });
  
  // Fecha
  page.drawText(`Fecha: ${formatDate(invoice.created_date)}`, {
    x: 50,
    y: height - 140,
    size: 12,
    font: font,
    color: textColor,
  });
  
  // Información del consultor
  page.drawText('CONSULTOR:', {
    x: 50,
    y: height - 200,
    size: 14,
    font: boldFont,
    color: primaryColor,
  });
  
  page.drawText(invoice.consultant?.name || '', {
    x: 50,
    y: height - 220,
    size: 12,
    font: font,
    color: textColor,
  });
  
  page.drawText(invoice.consultant?.email || '', {
    x: 50,
    y: height - 235,
    size: 10,
    font: font,
    color: textColor,
  });
  
  // Información del cliente
  page.drawText('CLIENTE:', {
    x: 300,
    y: height - 200,
    size: 14,
    font: boldFont,
    color: primaryColor,
  });
  
  page.drawText(invoice.client?.name || '', {
    x: 300,
    y: height - 220,
    size: 12,
    font: font,
    color: textColor,
  });
  
  page.drawText(invoice.client?.email || '', {
    x: 300,
    y: height - 235,
    size: 10,
    font: font,
    color: textColor,
  });
  
  // Período de trabajo
  page.drawText('PERÍODO DE TRABAJO:', {
    x: 50,
    y: height - 280,
    size: 14,
    font: boldFont,
    color: primaryColor,
  });
  
  page.drawText(`${formatDate(invoice.start_date)} - ${formatDate(invoice.end_date)}`, {
    x: 50,
    y: height - 300,
    size: 12,
    font: font,
    color: textColor,
  });
  
  // Descripción
  page.drawText('DESCRIPCIÓN:', {
    x: 50,
    y: height - 340,
    size: 14,
    font: boldFont,
    color: primaryColor,
  });
  
  page.drawText(invoice.description, {
    x: 50,
    y: height - 360,
    size: 12,
    font: font,
    color: textColor,
    maxWidth: width - 100,
  });
  
  // Total
  page.drawText('TOTAL:', {
    x: 400,
    y: height - 420,
    size: 18,
    font: boldFont,
    color: primaryColor,
  });
  
  page.drawText(formatCurrency(invoice.total), {
    x: 400,
    y: height - 440,
    size: 16,
    font: boldFont,
    color: textColor,
  });
  
  // Instrucciones de pago
  page.drawText('INSTRUCCIONES DE PAGO:', {
    x: 50,
    y: height - 500,
    size: 14,
    font: boldFont,
    color: primaryColor,
  });
  
  page.drawText(invoice.payment_instructions, {
    x: 50,
    y: height - 520,
    size: 10,
    font: font,
    color: textColor,
    maxWidth: width - 100,
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
  link.download = `factura-${invoice.number}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}; 