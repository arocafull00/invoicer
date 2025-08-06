import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Euro, TrendingUp, Calendar, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  {
    title: "Facturas este mes",
    value: "12",
    change: "+2.5%",
    changeType: "positive" as const,
    icon: FileText,
  },
  {
    title: "Ingresos totales",
    value: "€24,580",
    change: "+15.3%", 
    changeType: "positive" as const,
    icon: Euro,
  },
  {
    title: "Facturas pendientes",
    value: "3",
    change: "-1",
    changeType: "negative" as const,
    icon: Calendar,
  },
  {
    title: "Tasa de cobro",
    value: "94.2%",
    change: "+3.1%",
    changeType: "positive" as const,
    icon: TrendingUp,
  },
];

const recentInvoices = [
  {
    id: "INV-001",
    client: "ViralRankers Ltd",
    amount: "€2,880.00",
    status: "Pagada",
    date: "31 Jul 2024",
  },
  {
    id: "INV-002", 
    client: "TechCorp Solutions",
    amount: "€1,450.00",
    status: "Pendiente",
    date: "28 Jul 2024",
  },
  {
    id: "INV-003",
    client: "Digital Agency Pro",
    amount: "€3,200.00", 
    status: "Enviada",
    date: "25 Jul 2024",
  },
];

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6 bg-[#FFFFFF14] border-[#FFFFFF14] hover:bg-[#FFFFFF1A] transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#A1A1AA] text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                <p className={`text-sm mt-1 ${
                  stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.change} desde el mes pasado
                </p>
              </div>
              <div className="w-12 h-12 bg-[#7F5AF0]/20 rounded-lg flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-[#7F5AF0]" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <Card className="p-6 bg-[#FFFFFF14] border-[#FFFFFF14]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Facturas Recientes</h2>
            <Button variant="ghost" asChild className="text-[#7F5AF0] hover:bg-[#7F5AF0]/10">
              <Link to="/invoices">Ver todas</Link>
            </Button>
          </div>
          <div className="space-y-4">
            {recentInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between py-3 border-b border-[#FFFFFF14] last:border-0">
                <div className="flex-1">
                  <p className="font-medium text-white">{invoice.id}</p>
                  <p className="text-sm text-[#A1A1AA]">{invoice.client}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">{invoice.amount}</p>
                  <p className="text-sm text-[#A1A1AA]">{invoice.date}</p>
                </div>
                <div className="ml-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    invoice.status === 'Pagada' 
                      ? 'bg-green-500/20 text-green-400' 
                      : invoice.status === 'Pendiente'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
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
      </div>
    </div>
  );
};