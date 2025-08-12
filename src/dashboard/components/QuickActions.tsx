import React from 'react';
import { Card } from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import { Plus, FileText, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

export const QuickActions: React.FC = () => {
  return (
    <Card className="p-6 bg-[#FFFFFF14] border-[#FFFFFF14]">
      <h2 className="text-xl font-semibold text-white mb-6">Acciones Rápidas</h2>
      <div className="space-y-4">
        <Button asChild className="w-full bg-[#7F5AF0] text-white hover:bg-[#654DD4]">
          <Link to="/invoices/new">
            <Plus className="w-4 h-4 mr-2" />
            Crear nueva factura
          </Link>
        </Button>
        <Button variant="outline" asChild className="w-full bg-[#FFFFFF14] border-[#FFFFFF14] text-white hover:bg-[#FFFFFF1A]">
          <Link to="/invoices">
            <FileText className="w-4 h-4 mr-2" />
            Ver todas las facturas
          </Link>
        </Button>
        <Button variant="outline" asChild className="w-full bg-[#FFFFFF14] border-[#FFFFFF14] text-white hover:bg-[#FFFFFF1A]">
          <Link to="/reports">
            <BarChart3 className="w-4 h-4 mr-2" />
            Ver reportes
          </Link>
        </Button>
      </div>
    </Card>
  );
};
