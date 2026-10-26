import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/shared/components/PageHeader";

export const DashboardHeader: React.FC = () => {
  return (
    <PageHeader
      title="Dashboard"
      actions={
        <Button asChild>
          <Link href="/invoices/new" aria-label="Nueva Factura">
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Nueva Factura</span>
          </Link>
        </Button>
      }
    />
  );
};
