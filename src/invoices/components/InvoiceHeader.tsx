import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";

interface InvoiceHeaderProps {
  title: string;
  actionLabel: string;
  onAction: () => void;
  actionDisabled?: boolean;
}

export const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  title,
  actionLabel,
  onAction,
  actionDisabled = false,
}) => {
  const router = useRouter();

  return (
    <PageHeader
      title={title}
      actions={
        <>
          <Button onClick={onAction} disabled={actionDisabled}>
            {actionLabel}
          </Button>
          <Button
            variant="ghost"
            aria-label="Cerrar"
            onClick={() => router.push("/invoices")}
          >
            <X className="w-4 h-4" />
          </Button>
        </>
      }
    />
  );
};
