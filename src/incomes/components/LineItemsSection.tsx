import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { LineItemTemplateSelector } from "@/shared/components/LineItemTemplateSelector";

type LineItemWithoutId = Omit<
  import("@/shared/types").LineItem,
  "id" | "total"
>;

interface LineItemsSectionProps {
  lineItems: LineItemWithoutId[];
  currentLineItem: LineItemWithoutId;
  includeVat: boolean;
  vatRate: number;
  onUpdateLineItem: (index: number, data: Partial<LineItemWithoutId>) => void;
  onRemoveLineItem: (index: number) => void;
  onSetCurrentLineItem: (data: Partial<LineItemWithoutId>) => void;
  onAddLineItem: () => void;
  onVatChange: (includeVat: boolean) => void;
  getLineItemTotal: (item: LineItemWithoutId) => number;
  getSubtotal: () => number;
  getVatAmount: () => number;
  getTotalAmount: () => number;
}

export const LineItemsSection: React.FC<LineItemsSectionProps> = ({
  lineItems,
  currentLineItem,
  includeVat,
  vatRate,
  onUpdateLineItem,
  onRemoveLineItem,
  onSetCurrentLineItem,
  onAddLineItem,
  onVatChange,
  getLineItemTotal,
  getSubtotal,
  getVatAmount,
  getTotalAmount,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white">Conceptos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-card-foreground">Plantilla</Label>
            <LineItemTemplateSelector
              onSelectTemplate={(template) => {
                onSetCurrentLineItem({
                  description: template.description,
                  quantity: template.default_quantity,
                  rate: template.default_rate,
                });
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-card-foreground">Descripción</Label>
              <Input
                type="text"
                value={currentLineItem.description}
                onChange={(e) =>
                  onSetCurrentLineItem({ description: e.target.value })
                }
                placeholder="Descripción del concepto..."
                className="bg-input border-border text-card-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-card-foreground">Cantidad</Label>
              <Input
                type="number"
                min="0"
                step="1"
                className="bg-input border-border text-card-foreground"
                value={currentLineItem.quantity}
                onChange={(e) =>
                  onSetCurrentLineItem({ quantity: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-card-foreground">Tarifa (€)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                className="bg-input border-border text-card-foreground"
                value={currentLineItem.rate}
                onChange={(e) =>
                  onSetCurrentLineItem({ rate: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-card-foreground">Total</Label>
              <div className="h-10 flex items-center px-3 rounded-md bg-[#FFFFFF14]/30 border border-border">
                <span className="text-white font-medium">
                  € {getLineItemTotal(currentLineItem).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onAddLineItem}
            disabled={
              !currentLineItem.description ||
              currentLineItem.quantity <= 0 ||
              currentLineItem.rate <= 0
            }
            className="flex items-center gap-2 w-full md:w-auto"
          >
            <Plus className="w-4 h-4" />
            Añadir concepto
          </Button>
        </div>

        {/* Totals */}
        <div className="border-t border-border pt-6">
          <div className="flex flex-col md:flex-row md:justify-end">
            <div className="w-full md:w-80 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#A1A1AA]">Subtotal</span>
                <span className="text-white font-medium">
                  € {getSubtotal().toFixed(2)}
                </span>
              </div>
              {includeVat && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#A1A1AA]">IVA ({vatRate}%)</span>
                  <span className="text-white font-medium">
                    € {getVatAmount().toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-white font-semibold text-base">
                  Total
                </span>
                <span className="text-white font-bold text-xl">
                  € {getTotalAmount().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* VAT Toggle */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Switch
                id="include-vat"
                checked={includeVat}
                onCheckedChange={onVatChange}
              />
              <Label htmlFor="include-vat" className="text-card-foreground">
                Incluir IVA ({vatRate}%)
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              {includeVat
                ? "La factura incluirá IVA en el total"
                : "Esta operación está exenta de IVA"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
