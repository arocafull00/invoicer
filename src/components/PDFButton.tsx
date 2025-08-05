import React, { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { downloadInvoicePDF } from '../lib/pdf';
import { Invoice } from '../types';

interface PDFButtonProps {
  invoice: Invoice;
  className?: string;
  variant?: 'primary' | 'secondary';
}

export const PDFButton: React.FC<PDFButtonProps> = ({
  invoice,
  className = '',
  variant = 'secondary',
}) => {
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

  const baseClasses = 'inline-flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors disabled:opacity-50';
  const variantClasses = variant === 'primary' 
    ? 'bg-primary hover:bg-accent text-white' 
    : 'bg-surface hover:bg-surface/50 text-text border border-surface';

  return (
    <button
      onClick={handleDownload}
      disabled={isLoading}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <FileText className="w-4 h-4" />
      )}
      <span className="text-sm font-medium">
        {isLoading ? 'Generando...' : 'PDF'}
      </span>
    </button>
  );
}; 