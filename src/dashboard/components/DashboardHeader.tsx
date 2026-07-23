import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export const DashboardHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Resumen de tu actividad de facturación</p>
      </div>
      <Button asChild>
        <Link href="/invoices/new">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Factura
        </Link>
      </Button>
    </div>
  );
};
