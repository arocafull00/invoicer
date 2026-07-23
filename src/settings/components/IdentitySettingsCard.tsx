import { Card } from "@/components/ui/card";
import { LogoUpload } from "@/settings/components/LogoUpload";

export function IdentitySettingsCard() {
  return (
    <Card className="p-6">
      <h2 className="mb-4 text-xl font-semibold text-card-foreground">
        Identidad
      </h2>
      <LogoUpload />
    </Card>
  );
}
