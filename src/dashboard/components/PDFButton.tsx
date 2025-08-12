import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { downloadInvoicePDF } from '@/shared/lib/pdf';
import type { Invoice } from '@/shared/types';

interface PDFButtonProps {
  invoice: Invoice;
}

export const PDFButton: React.FC<PDFButtonProps> = ({ invoice }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      await downloadInvoicePDF(invoice);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isLoading}
      className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      PDF
    </button>
  );
}; 