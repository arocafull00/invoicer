import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
      toast.error('No se pudo descargar el PDF');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleDownload}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      PDF
    </Button>
  );
};
