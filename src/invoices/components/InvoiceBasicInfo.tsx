import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_LOGO_URL } from "@/shared/lib/appLogo";

interface InvoiceBasicInfoProps {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  onInvoiceNumberChange?: (value: string) => void;
  onIssueDateChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
  readOnlyNumber?: boolean;
}

export const InvoiceBasicInfo: React.FC<InvoiceBasicInfoProps> = ({
  invoiceNumber,
  issueDate,
  dueDate,
  onInvoiceNumberChange,
  onIssueDateChange,
  onDueDateChange,
  readOnlyNumber = false,
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-2">
              <Label className="text-card-foreground">Número de factura</Label>
              <Input
                value={invoiceNumber}
                onChange={(e) => onInvoiceNumberChange?.(e.target.value)}
                readOnly={readOnlyNumber}
                className="bg-input border-border text-card-foreground"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-card-foreground">Fecha de emisión</Label>
                <Input
                  type="date"
                  value={issueDate}
                  onChange={(e) => onIssueDateChange(e.target.value)}
                  className="bg-input border-border text-card-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">Fecha de vencimiento</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => onDueDateChange(e.target.value)}
                  className="bg-input border-border text-card-foreground"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-full h-40 rounded-xl border border-border bg-accent/50 flex items-center justify-center p-4">
              <img
                src={APP_LOGO_URL}
                alt="Logo"
                className="max-h-36 object-contain"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
