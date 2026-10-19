import type { Invoice } from "@/shared/types";

export function getInvoiceEmailContent(invoice: Invoice) {
  const monthFormat = new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const startMonth = monthFormat.format(new Date(invoice.start_date.slice(0, 10)));
  const endMonth = monthFormat.format(new Date(invoice.end_date.slice(0, 10)));
  const period = startMonth === endMonth
    ? `mes de ${startMonth}`
    : `período de ${startMonth} a ${endMonth}`;
  const greeting = new Date().getHours() < 12 ? "buenos días" : "buenas tardes";

  return {
    subject: `Factura ${invoice.number} · ${startMonth === endMonth ? startMonth : `${startMonth} a ${endMonth}`}`,
    body: `Hola, ${greeting}:\n\nTe adjunto la factura correspondiente al ${period}.\n\nMuchas gracias.\nUn saludo,\n${invoice.consultant.name}`,
  };
}
