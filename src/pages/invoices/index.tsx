import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Plus, FileText } from 'lucide-react';
import { useInvoiceStore } from '../../lib/stores';
import { PDFButton } from '../../components/PDFButton';
import { exportToCSV } from '../../lib/csv';
import { formatDate, formatCurrency } from '../../lib/helpers';
import { Invoice } from '../../types';

export const InvoicesPage: React.FC = () => {
  const { invoices, loading, setInvoices } = useInvoiceStore();
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simular carga de datos - en producción esto vendría de Supabase
    const mockInvoices: Invoice[] = [
      {
        id: '1',
        number: 1001,
        consultant_id: '1',
        client_id: '1',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        created_date: '2024-01-15',
        description: 'Desarrollo de aplicación web',
        total: 2500,
        payment_instructions: 'Transferencia bancaria',
        status: 'paid',
        created_at: '2024-01-15T10:00:00Z',
        consultant: { id: '1', name: 'Juan Pérez', email: 'juan@example.com', created_at: '2024-01-01' },
        client: { id: '1', name: 'Empresa ABC', email: 'contacto@abc.com', address: 'Madrid, España', created_at: '2024-01-01' },
      },
      {
        id: '2',
        number: 1002,
        consultant_id: '1',
        client_id: '2',
        start_date: '2024-02-01',
        end_date: '2024-02-28',
        created_date: '2024-02-15',
        description: 'Consultoría de diseño',
        total: 1800,
        payment_instructions: 'Transferencia bancaria',
        status: 'sent',
        created_at: '2024-02-15T10:00:00Z',
        consultant: { id: '1', name: 'Juan Pérez', email: 'juan@example.com', created_at: '2024-01-01' },
        client: { id: '2', name: 'Startup XYZ', email: 'hello@xyz.com', address: 'Barcelona, España', created_at: '2024-01-01' },
      },
    ];
    setInvoices(mockInvoices);
  }, [setInvoices]);

  useEffect(() => {
    const filtered = invoices.filter(invoice =>
      invoice.number.toString().includes(searchTerm) ||
      invoice.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInvoices(filtered);
  }, [invoices, searchTerm]);

  const handleExportCSV = () => {
    exportToCSV(filteredInvoices);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-textMedium">Cargando facturas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">Mis Facturas</h1>
          <p className="text-textMedium mt-1">
            Gestiona y descarga tus facturas
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </button>
          <Link
            to="/invoices/new"
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Factura</span>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="Buscar facturas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field w-full"
        />
      </div>

      {/* Table */}
      <div className="bg-surface rounded-lg border border-surface/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-textMedium uppercase tracking-wider">
                  Nº
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textMedium uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textMedium uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textMedium uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textMedium uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textMedium uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textMedium uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface/20">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-textMedium">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">No hay facturas</p>
                      <p className="mb-4">Crea tu primera factura para empezar</p>
                      <Link
                        to="/invoices/new"
                        className="btn-primary inline-flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Crear Factura</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-surface/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">
                      #{invoice.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-textMedium">
                      {formatDate(invoice.created_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                      {invoice.client?.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-textMedium max-w-xs truncate">
                      {invoice.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">
                      {formatCurrency(invoice.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : invoice.status === 'sent'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {invoice.status === 'paid' ? 'Pagada' : 
                         invoice.status === 'sent' ? 'Enviada' : 'Borrador'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <PDFButton invoice={invoice} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {filteredInvoices.length > 0 && (
        <div className="flex justify-between items-center text-sm text-textMedium">
          <span>
            Mostrando {filteredInvoices.length} de {invoices.length} facturas
          </span>
          <span>
            Total: {formatCurrency(filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0))}
          </span>
        </div>
      )}
    </div>
  );
}; 