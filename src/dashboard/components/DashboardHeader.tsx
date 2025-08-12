import React from 'react';
import { Button } from "@/shared/components/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export const DashboardHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-[#A1A1AA] mt-1">Resumen de tu actividad de facturación</p>
      </div>
      <Button asChild className="bg-[#7F5AF0] text-white hover:bg-[#654DD4]">
        <Link to="/invoices/new">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Factura
        </Link>
      </Button>
    </div>
  );
};
