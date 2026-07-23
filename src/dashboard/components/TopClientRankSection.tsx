import React from "react";
import type { ClientRanking } from "@/shared/lib/dashboardUtils";
import { TopClientRankRow } from "./TopClientRankRow";

interface TopClientRankSectionProps {
  title: string;
  clients: ClientRanking[];
  getValueLabel: (client: ClientRanking) => string;
}

export const TopClientRankSection: React.FC<TopClientRankSectionProps> = ({
  title,
  clients,
  getValueLabel,
}) => {
  if (clients.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">{title}</h3>
        <p className="text-sm text-muted-foreground py-2">Sin datos</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-3">{title}</h3>
      <div className="space-y-1">
        {clients.map((client, index) => (
          <TopClientRankRow
            key={client.clientId}
            rank={index + 1}
            clientName={client.clientName}
            valueLabel={getValueLabel(client)}
          />
        ))}
      </div>
    </div>
  );
};
