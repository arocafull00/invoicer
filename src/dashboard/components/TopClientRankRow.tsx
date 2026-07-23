import React from "react";

interface TopClientRankRowProps {
  rank: number;
  clientName: string;
  valueLabel: string;
}

export const TopClientRankRow: React.FC<TopClientRankRowProps> = ({
  rank,
  clientName,
  valueLabel,
}) => {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
          {rank}
        </span>
        <p className="truncate font-medium text-foreground">{clientName}</p>
      </div>
      <p className="shrink-0 text-sm font-semibold text-foreground">{valueLabel}</p>
    </div>
  );
};
