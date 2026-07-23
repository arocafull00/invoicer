import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { resolveLogoUrl } from "@/shared/lib/appLogo";
import { useSettingsStore } from "@/shared/lib/stores";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = "image/png,image/jpeg,image/webp";

export function LogoUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const settings = useSettingsStore((s) => s.settings);
  const uploadLogo = useSettingsStore((s) => s.uploadLogo);
  const removeLogo = useSettingsStore((s) => s.removeLogo);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const hasCustomLogo = Boolean(settings?.logo_url);
  const logoSrc = resolveLogoUrl(settings?.logo_url);

  const handleFile = async (file: File | undefined) => {
    if (!file || isUploading) return;
    setIsUploading(true);
    try {
      await uploadLogo(file);
    } catch {
      return;
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    if (isUploading || !hasCustomLogo) return;
    setIsUploading(true);
    try {
      await removeLogo();
    } catch {
      return;
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-card-foreground">Logo</Label>
        {hasCustomLogo ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isUploading}
            onClick={handleRemove}
            className="h-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
            Quitar
          </Button>
        ) : null}
      </div>
      <button
        type="button"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          void handleFile(event.dataTransfer.files?.[0]);
        }}
        className={cn(
          "group relative flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-accent/50 p-4 transition-colors",
          "hover:border-primary/50 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isDragging && "border-primary bg-primary/10",
          isUploading && "pointer-events-none opacity-70"
        )}
      >
        <img
          src={logoSrc}
          alt="Logo"
          className="max-h-36 object-contain"
        />
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80 transition-opacity",
            isUploading || isDragging
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
          )}
        >
          {isUploading ? (
            <Loader2 className="size-6 animate-spin text-primary" />
          ) : (
            <>
              <ImagePlus className="size-6 text-primary" />
              <span className="text-sm text-foreground">
                {isDragging ? "Suelta para subir" : "Subir logo"}
              </span>
              <span className="text-xs text-muted-foreground">
                PNG, JPG o WEBP · máx. 1 MB
              </span>
            </>
          )}
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="sr-only"
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
        }}
      />
    </div>
  );
}
