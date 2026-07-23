import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import Link from "next/link";

export const QuickActions: React.FC = () => {
  return (
    <Card className="p-6  ">
      <h2 className="text-xl font-semibold text-foreground mb-6">Acciones Rápidas</h2>
      <div className="space-y-4">
        <Button asChild className="w-full">
          <Link href="/invoices/new">
            <Plus className="w-4 h-4 mr-2" />
            Crear nueva factura
          </Link>
        </Button>
        <Button variant="outline" asChild className="w-full">
          <Link href="/invoices">
            <FileText className="w-4 h-4 mr-2" />
            Ver todas las facturas
          </Link>
        </Button>
        <Button variant="outline" asChild className="w-full">
          <Link href="/consultants">
            <FileText className="w-4 h-4 mr-2" />
            Gestionar consultores
          </Link>
        </Button>
      </div>
    </Card>
  );
};
