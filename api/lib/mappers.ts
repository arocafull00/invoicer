type DbLineItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  total: number;
  include_vat: boolean;
  order_index: number;
};

type DbInvoiceRow = {
  id: string;
  number: string;
  created_date: string;
  start_date: string;
  end_date: string;
  description: string | null;
  subtotal: number | null;
  vat_rate: number | null;
  vat_amount: number | null;
  total: number;
  vat_exempt: boolean;
  status: string;
  deleted: boolean;
  irpf_rate: number | null;
  irpf_amount: number | null;
  consultant: Record<string, unknown> | null;
  client: Record<string, unknown> | null;
  payment_instructions: Record<string, unknown> | null;
  line_items?: DbLineItem[];
};

export function mapLineItem(row: DbLineItem) {
  return {
    id: row.id,
    description: row.description,
    quantity: Number(row.quantity),
    rate: Number(row.rate),
    total: Number(row.total),
    includeVat: row.include_vat ?? false,
  };
}

export function mapInvoice(row: DbInvoiceRow) {
  const lineItems = (row.line_items ?? [])
    .sort((a, b) => a.order_index - b.order_index)
    .map(mapLineItem);

  return {
    id: row.id,
    number: row.number,
    created_date: row.created_date,
    start_date: row.start_date,
    end_date: row.end_date,
    description: row.description ?? undefined,
    subtotal: Number(row.subtotal ?? row.total),
    vat_rate: Number(row.vat_rate ?? 0),
    vat_amount: Number(row.vat_amount ?? 0),
    total: Number(row.total),
    vat_exempt: row.vat_exempt,
    status: row.status,
    deleted: row.deleted,
    irpf_rate: row.irpf_rate != null ? Number(row.irpf_rate) : null,
    irpf_amount: row.irpf_amount != null ? Number(row.irpf_amount) : null,
    consultant: row.consultant,
    client: row.client,
    payment_instructions: row.payment_instructions,
    line_items: lineItems,
  };
}
