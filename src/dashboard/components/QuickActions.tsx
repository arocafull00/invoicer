import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

export const QuickActions: React.FC = () => {
  return (
    <Card className="p-6  ">
      <h2 className="text-xl font-semibold text-foreground mb-6">Acciones Rápidas</h2>
      <div className="space-y-4">
        <Button asChild className="w-full">
          <Link to="/invoices/new">
            <Plus className="w-4 h-4 mr-2" />
            Crear nueva factura
          </Link>
        </Button>
        <Button variant="outline" asChild className="w-full">
          <Link to="/invoices">
            <FileText className="w-4 h-4 mr-2" />
            Ver todas las facturas
          </Link>
        </Button>
        <Button variant="outline" asChild className="w-full">
          <Link to="/incomes">
            <BarChart3 className="w-4 h-4 mr-2" />
            Ver ingresos
          </Link>
        </Button>
      </div>
    </Card>
  );
};
