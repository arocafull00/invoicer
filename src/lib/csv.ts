import { Invoice } from '../types';
import { formatDate, formatCurrency } from './helpers';

/**
 * Exporta las facturas a CSV con el formato específico
 */
export const exportToCSV = (invoices: Invoice[]): void => {
  if (invoices.length === 0) return;

  const csvRows: string[][] = [];

  invoices.forEach((invoice) => {
    // Filas vacías iniciales
    csvRows.push(['', '', '', '', '']);
    
    // Fecha y número de factura
    csvRows.push(['', '', '', '', formatDate(invoice.created_date), invoice.number]);
    
    // Filas vacías
    csvRows.push(['', '', '', '', '', '']);
    
    // Sección Consultant
    csvRows.push(['Consultant', '', '', 'Start time - Included', 'End time - Included', '']);
    csvRows.push([invoice.consultant.name, '', '', formatDate(invoice.start_date), formatDate(invoice.end_date), '']);
    csvRows.push([invoice.consultant.address, '', '', '', '', '']);
    csvRows.push([invoice.consultant.city + ', ' + invoice.consultant.country, '', '', '', '', '']);
    csvRows.push(['NIF: ' + invoice.consultant.nif, '', '', '', '', '']);
    csvRows.push(['Email: ' + invoice.consultant.email, '', '', '', '', '']);
    
    // Filas vacías
    csvRows.push(['', '', '', '', '', '']);
    csvRows.push(['', '', '', '', '', '']);
    
    // Sección Client y Payment instructions
    csvRows.push(['Client', '', '', 'Payment instructions', '', '']);
    csvRows.push([invoice.client.name, '', '', 'Account Holder', invoice.payment_instructions.account_holder, '']);
    csvRows.push([invoice.client.address, '', '', 'IBAN', invoice.payment_instructions.iban, '']);
    csvRows.push([invoice.client.city + ', ' + invoice.client.country, '', '', 'Payment method', invoice.payment_instructions.payment_method, '']);
    if (invoice.client.company_number) {
      csvRows.push(['Company Number: ' + invoice.client.company_number, '', '', '', '', '']);
    }
    csvRows.push(['', '', '', invoice.payment_instructions.payment_terms, '', '']);
    csvRows.push(['', '', '', invoice.payment_instructions.vat_exemption_text, '', '']);
    
    // Descripción y Total
    csvRows.push(['DESCRIPTION', '', '', '', '', 'TOTAL']);
    csvRows.push([invoice.description, '', '', '', '', formatCurrency(invoice.total)]);
    
    // Filas vacías
    csvRows.push(['', '', '', '', '', '']);
    csvRows.push(['', '', '', '', '', '']);
    csvRows.push(['', '', '', '', '', '']);
    
    // Subtotal
    csvRows.push(['', '', '', '', 'Subtotal', formatCurrency(invoice.total)]);
  });

  // Convertir a CSV
  const csvContent = csvRows
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  // Crear y descargar archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `invoice_${invoices[0].number.replace(/\s+/g, '_')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}; 