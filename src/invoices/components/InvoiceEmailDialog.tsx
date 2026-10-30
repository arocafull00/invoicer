import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInvoiceEmailContent } from "@/shared/lib/invoiceEmail";
import type { Invoice } from "@/shared/types";

export function InvoiceEmailDialog({
  invoice,
  onClose,
}: {
  invoice: Invoice;
  onClose: () => void;
}) {
  const [accountEmail, setAccountEmail] = useState(invoice.consultant.email.trim());
  const { subject, body } = getInvoiceEmailContent(invoice);

  const handleOpenGmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams({
      authuser: accountEmail.trim(),
      view: "cm",
      fs: "1",
      to: invoice.client.email?.trim() ?? "",
      su: subject,
      body,
    });
    window.open(`https://mail.google.com/mail/?${params}`, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Preparar correo en Gmail</DialogTitle>
          <DialogDescription>
            Revisa la cuenta y el destinatario de la factura {invoice.number}.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-1 flex-col gap-6" onSubmit={handleOpenGmail}>
          <div className="space-y-2">
            <Label htmlFor="invoice-email-account">Cuenta de Gmail para enviar</Label>
            <Input
              id="invoice-email-account"
              type="email"
              required
              value={accountEmail}
              onChange={(event) => setAccountEmail(event.target.value.trim())}
              aria-describedby="invoice-email-account-help"
            />
            <p id="invoice-email-account-help" className="text-sm text-muted-foreground">
              Por defecto, el correo del prestador del servicio. Puedes cambiarlo por otra cuenta de Gmail.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoice-email-recipient">Para</Label>
            <Input id="invoice-email-recipient" value={invoice.client.email?.trim() ?? ""} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoice-email-subject">Asunto</Label>
            <Input id="invoice-email-subject" value={subject} readOnly />
          </div>
          <p className="text-sm text-muted-foreground">
            Se solicitará esta cuenta al abrir Gmail. El remitente definitivo se confirma en el campo «De» de Gmail, especialmente si utilizas alias.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cerrar</Button>
            <Button type="submit" disabled={!accountEmail.trim()}>
              <Mail className="size-4" aria-hidden="true" />
              Abrir en Gmail
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
