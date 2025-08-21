import React from 'react';
import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: LucideIcon;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon 
}) => {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#A1A1AA] text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-2">{value}</p>
          <p className={`text-sm mt-1 ${
            changeType === 'positive' ? 'text-green-400' : 'text-red-400'
          }`}>
            {change} desde el mes pasado
          </p>
        </div>
        <div className="w-12 h-12 bg-[#7F5AF0]/20 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-[#7F5AF0]" />
        </div>
      </div>
    </Card>
  );
};
