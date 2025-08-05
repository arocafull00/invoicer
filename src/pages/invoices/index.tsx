import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Download, Plus, FileText } from 'lucide-react';
import { useInvoiceStore } from '@/lib/stores';
import { PDFButton } from '@/components/PDFButton';
import { exportToCSV } from '@/lib/csv';
import { formatDate, formatCurrency } from '@/lib/helpers';

export const InvoicesPage: React.FC = () => {
  const { invoices } = useInvoiceStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = invoices.filter(invoice =>
    invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.consultant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    exportToCSV(filteredInvoices);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">Facturas</h1>
          <p className="text-textMedium">
            Gestiona y exporta tus facturas
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
          
          <Link
            to="/invoices/new"
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Crear Factura
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textMedium w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar facturas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-full pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-textMedium uppercase tracking-wider">
                  Número
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textMedium uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textMedium uppercase tracking-wider">
                  Consultor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textMedium uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textMedium uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textMedium uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textMedium uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface/20">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-textMedium">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="w-12 h-12 text-textMedium/50" />
                      <div>
                        <p className="font-medium text-text">No hay facturas</p>
                        <p className="text-sm">Crea tu primera factura para comenzar</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-surface/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-text">
                        {invoice.number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-textMedium">
                        {formatDate(invoice.created_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text">
                        {invoice.consultant.name}
                      </div>
                      <div className="text-xs text-textMedium">
                        {invoice.consultant.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text">
                        {invoice.client.name}
                      </div>
                      <div className="text-xs text-textMedium">
                        {invoice.client.city}, {invoice.client.country}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-textMedium">
                        {formatDate(invoice.start_date)} - {formatDate(invoice.end_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-text">
                        {formatCurrency(invoice.total)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PDFButton invoice={invoice} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredInvoices.length > 0 && (
        <div className="mt-4 text-sm text-textMedium">
          Mostrando {filteredInvoices.length} de {invoices.length} facturas
        </div>
      )}
    </div>
  );
}; 