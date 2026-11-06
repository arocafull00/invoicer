import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { expensePdfInputSchema } from '../lib/expenseValidation';
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
  const validation = expensePdfInputSchema.safeParse({ ...row.data, date: row.uploadDate });
  const problems = validation.success ? [] : [...new Set(validation.error.issues
    .filter(({ path }) => row.status === 'ready' || (path[0] === 'total' && row.data.total !== undefined))
    .map(({ message }) => message))];
  const status = row.status === 'saved' ? 'Guardado' : row.status === 'reading' ? 'Leyendo…' : validation.success ? 'Listo para guardar' : row.status === 'queued' ? 'Pendiente de leer' : 'Completa los datos';
  return <article className="min-w-0 space-y-4 border-b border-border py-6 last:border-0">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0"><h3 className="break-all font-medium">{row.file.name}</h3><p className="text-sm text-muted-foreground">{status} · {(row.file.size / 1024).toFixed(0)} KB</p></div>
      <div className="flex gap-2"><Button variant="outline" size="sm" asChild><a ref={link} href="#" target="_blank" rel="noopener noreferrer">Ver PDF</a></Button>
        <Button variant="ghost" size="sm" disabled={disabled} onClick={onRemove}>Quitar</Button></div>
    </div>
    {row.error ? <p role="alert" className="text-sm text-destructive">{row.error}</p> : null}
    {row.warnings.length ? <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">{row.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : null}
    <fieldset disabled={disabled || row.status === 'saved'} className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {([
        ['provider', 'Proveedor', 'text'],
        ['concept', 'Concepto', 'text'],
        ['total', 'Total a pagar (€)', 'number'],
      ] as const).map(([key, label, type]) => (
        <div key={key} className="min-w-0 space-y-2">
          <Label htmlFor={`${row.id}-${key}`}>{label}</Label>
          <Input id={`${row.id}-${key}`} type={type} step={key === 'total' ? '0.01' : undefined}
            value={row.data[key] ?? ''}
            onChange={(e) => {
              const value = key === 'total' ? (e.target.value === '' ? undefined : e.target.valueAsNumber) : e.target.value;
              onChange({ ...row, data: { ...row.data, [key]: value }, error: undefined });
            }} />
        </div>
      ))}
      <div className="space-y-2">
        <Label htmlFor={`${row.id}-upload-date`}>Fecha de subida</Label>
        <Input id={`${row.id}-upload-date`} type="date" value={row.uploadDate} readOnly />
      </div>
    </fieldset>
    {row.status !== 'saved' && problems.length > 0 ? <p className="text-sm text-destructive">{problems.join('. ')}</p> : null}
  </article>;
}
