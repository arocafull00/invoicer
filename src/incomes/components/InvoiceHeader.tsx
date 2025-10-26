import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface InvoiceHeaderProps {
  title: string;
  subtitle: string;
  actionLabel: string;
  onAction: () => void;
  actionDisabled?: boolean;
}

export const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  actionDisabled = false,
}) => {
  const navigate = useNavigate();

  return (
    <>
      <Button
        className="fixed top-4 right-4"
        variant="ghost"
        onClick={() => navigate("/invoices")}
      >
        <X className="w-4 h-4" />
      </Button>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          <p className="text-[#A1A1AA] mt-1">{subtitle}</p>
        </div>
        <Button onClick={onAction} disabled={actionDisabled}>
          {actionLabel}
        </Button>
      </div>
    </>
  );
};
