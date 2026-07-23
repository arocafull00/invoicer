import React from "react";
import {
  DashboardHeader,
  StatsGrid,
  RecentInvoices,
  TopClientsCard,
  QuarterlyTaxesCard,
} from "./components";

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <DashboardHeader />
      <StatsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentInvoices />
        <QuarterlyTaxesCard />
        <TopClientsCard />
      </div>
    </div>
  );
};
