import type { PdfColorPalette } from "@/shared/types";

const PALETTE_COLORS: Record<PdfColorPalette, string> = {
  violet: "bg-[#7F5AF0]",
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
};

interface PdfPaletteOptionProps {
  value: PdfColorPalette;
  label: string;
}

export function PdfPaletteOption({ value, label }: PdfPaletteOptionProps) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className={`size-3.5 shrink-0 rounded-full ring-1 ring-white/20 ${PALETTE_COLORS[value]}`}
        aria-hidden
      />
      <span>{label}</span>
    </span>
  );
}
