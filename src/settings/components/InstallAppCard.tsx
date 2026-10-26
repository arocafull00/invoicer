import { CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePwaInstall } from "@/shared/hooks/usePwaInstall";

export function InstallAppCard() {
  const { canInstall, isInstalled, isIos, install } = usePwaInstall();

  return (
    <Card className="flex h-full flex-col gap-0">
      <CardHeader className="gap-3 border-b border-border/40 pb-5">
        <div className="space-y-1.5">
          <CardTitle className="text-xl text-card-foreground">
            Aplicación
          </CardTitle>
          <CardDescription>
            Instala Invoicer en tu dispositivo para abrirlo como una app
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 pt-5">
        {isInstalled ? (
          <p className="flex items-center gap-2 text-sm text-card-foreground">
            <CheckCircle2 className="size-4 text-primary" />
            La aplicación ya está instalada
          </p>
        ) : canInstall ? (
          <Button
            onClick={install}
            className="h-11 w-full bg-[linear-gradient(#9b7cf5,#7F5AF0)] text-white shadow-[inset_0_1px_0_#ffffff59,inset_0_-2px_0_#0003,0_1px_2px_#0006,0_8px_24px_-6px_#7F5AF099] hover:opacity-95 active:translate-y-px active:shadow-[inset_0_2px_4px_#0004] sm:w-auto"
          >
            <Download />
            Instalar aplicación
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            {isIos
              ? "En Safari, pulsa Compartir y luego \"Añadir a pantalla de inicio\"."
              : "Usa la opción \"Instalar aplicación\" del menú de tu navegador."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
