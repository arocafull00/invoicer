import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ExpenseFields } from './ExpenseFields';
import { expenseReviewSchema } from '../lib/expenseValidation';
import type { PdfExpenseDraft } from '../lib/pdfDrafts';

export function PdfExpenseReview({ row, onChange, onRemove, disabled }: {
  row: PdfExpenseDraft; onChange: (row: PdfExpenseDraft) => void; onRemove: () => void; disabled: boolean;
}) {
  const link = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const objectUrl = URL.createObjectURL(row.file);
    if (link.current) link.current.href = objectUrl;
    return () => URL.revokeObjectURL(objectUrl);
  }, [row.file]);
  const validation = expenseReviewSchema.safeParse(row.data);
  const fieldNames: Record<string, string> = { date: 'Fecha', fiscal_date: 'Imputación', provider: 'Proveedor', concept: 'Concepto', base_amount: 'Base', vat_amount: 'IVA', retention_amount: 'Retención', total: 'Total', currency: 'Moneda' };
  const problems = validation.success ? [] : [...new Set(validation.error.issues.map((issue) => `${fieldNames[String(issue.path[0])] ?? String(issue.path[0])}: ${issue.message}`))];
  const status = row.status === 'saved' ? 'Guardado' : row.status === 'reading' ? 'Leyendo…' : row.status === 'queued' ? 'Pendiente de leer' : row.reviewed && validation.success ? 'Listo para guardar' : 'Necesita revisión';
  return <article className="min-w-0 space-y-4 border-b border-border py-6 last:border-0">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0"><h3 className="break-all font-medium">{row.file.name}</h3><p className="text-sm text-muted-foreground">{status} · {(row.file.size / 1024).toFixed(0)} KB</p></div>
      <div className="flex gap-2"><Button variant="outline" size="sm" asChild><a ref={link} href="#" target="_blank" rel="noopener noreferrer">Ver PDF</a></Button>
        <Button variant="ghost" size="sm" disabled={disabled} onClick={onRemove}>Quitar</Button></div>
    </div>
    {row.error ? <p role="alert" className="text-sm text-destructive">{row.error}</p> : null}
    {row.warnings.length ? <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">{row.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : null}
    <ExpenseFields prefix={row.id} value={row.data} disabled={disabled || row.status === 'saved'} onChange={(data) => onChange({ ...row, data, reviewed: false, error: undefined, status: 'ready' })} />
    {row.status !== 'saved' ? <>
      {problems.length > 0 && row.status === 'ready' ? <p className="text-sm text-destructive">{problems.join('. ')}</p> : null}
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1 size-4 accent-primary" checked={row.reviewed} disabled={disabled || !validation.success || row.data.currency !== 'EUR'}
        onChange={(e) => onChange({ ...row, reviewed: e.target.checked, status: 'ready' })} />He comprobado los importes, el trimestre y la parte deducible.</label>
    </> : null}
  </article>;
}
