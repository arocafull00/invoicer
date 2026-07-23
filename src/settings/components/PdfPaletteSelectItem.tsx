import { SelectItem } from "@/components/ui/select";
import type { PdfColorPalette } from "@/shared/types";
import { PdfPaletteOption } from "@/settings/components/PdfPaletteOption";

interface PdfPaletteSelectItemProps {
  value: PdfColorPalette;
  label: string;
}

export function PdfPaletteSelectItem({
  value,
  label,
}: PdfPaletteSelectItemProps) {
  return (
    <SelectItem value={value} className="text-popover-foreground">
      <PdfPaletteOption value={value} label={label} />
    </SelectItem>
  );
}
