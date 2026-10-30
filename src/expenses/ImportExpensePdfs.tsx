'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { ArrowLeft, FileUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/shared/components/PageHeader';
import { apiClient } from '@/shared/api/client';
import { useExpensesStore } from './store/useExpensesStore';
import { expenseIdentity, expenseReviewSchema, fiscalDateForQuarter, MAX_EXPENSE_PDF_BYTES } from './lib/expenseValidation';
import { useAppCache } from '@/shared/lib/appCache';
import { readPdfDrafts, savePdfDrafts, type PdfExpenseDraft } from './lib/pdfDrafts';
import { PdfExpenseReview } from './components/PdfExpenseReview';
import type { PdfExtractor } from './lib/pdfExtraction';

export default function ImportExpensePdfs() {
  const { userId } = useAuth();
  const input = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<PdfExpenseDraft[]>([]);
  const [restored, setRestored] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [quarter, setQuarter] = useState('auto');
  const alive = useRef(false);
  const cancelled = useRef(false);
  const extractor = useRef<PdfExtractor | null>(null);
  const actor = useRef(userId);
  useEffect(() => { actor.current = userId; }, [userId]);
  const persistenceWarning = useRef(false);
  const busyRef = useRef(false);
  const latestRows = useRef<PdfExpenseDraft[] | null>(null);
  useEffect(() => { if (restored) latestRows.current = rows; }, [rows, restored]);

  useEffect(() => {
    alive.current = true;
    const generation = useAppCache.getState().generation;
    let active = true;
    const onUnauthorized = () => { alive.current = false; cancelled.current = true; extractor.current?.dispose(); };
    window.addEventListener('invoicer:unauthorized', onUnauthorized);
    window.addEventListener('invoicer:cache-cleared', onUnauthorized);
    if (userId) void readPdfDrafts(userId).then((saved) => { if (active) { setRows(saved); setRestored(true); } }).catch(() => {
      if (active) { setRestored(true); toast.error('El navegador no permite guardar el progreso. Mantén esta página abierta.'); }
    });
    return () => {
      if (userId && latestRows.current && generation === useAppCache.getState().generation && useAppCache.getState().owner === userId) void savePdfDrafts(userId, latestRows.current).catch(() => {});
      active = false; alive.current = false; cancelled.current = true; extractor.current?.dispose(); window.removeEventListener('invoicer:unauthorized', onUnauthorized); window.removeEventListener('invoicer:cache-cleared', onUnauthorized);
    };
  }, [userId]);

  useEffect(() => {
    if (!restored || !userId) return;
    const generation = useAppCache.getState().generation;
    const timer = setTimeout(() => {
      if (!alive.current || generation !== useAppCache.getState().generation) return;
      void savePdfDrafts(userId, rows).catch(() => {
        if (!persistenceWarning.current) { persistenceWarning.current = true; toast.error('No se ha podido guardar el progreso local. Mantén esta página abierta.'); }
      });
    }, 150);
    return () => clearTimeout(timer);
  }, [rows, restored, userId]);

  const patch = (id: string, changes: Partial<PdfExpenseDraft>) => {
    if (alive.current) setRows((current) => current.map((row) => row.id === id ? { ...row, ...changes } : row));
  };
  const selectFiles = async (files: File[]) => {
    if (busyRef.current || !restored) return;
    if (rows.length + files.length > 50) { toast.error('Puedes preparar hasta 50 PDF por lote. Guarda o quita los anteriores para continuar.'); return; }
    if ([...rows.map((row) => row.file), ...files].reduce((total, file) => total + file.size, 0) > 60 * 1024 * 1024) { toast.error('El lote no puede superar 60 MB. Importa los documentos en varios lotes.'); return; }
    busyRef.current = true; setBusy(true);
    try {
      const hashed = await Promise.all(files.map(async (file) => {
        if (!file.name.toLowerCase().endsWith('.pdf') || file.size === 0 || file.size > MAX_EXPENSE_PDF_BYTES) { toast.error(`${file.name}: selecciona un PDF de hasta 3 MB.`); return null; }
        const buffer = await file.arrayBuffer();
        if (!new TextDecoder().decode(buffer.slice(0, 1024)).includes('%PDF-')) { toast.error(`${file.name}: no es un PDF válido.`); return null; }
        const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', buffer))).map((n) => n.toString(16).padStart(2, '0')).join('');
        return { id: crypto.randomUUID(), file, hash, status: 'queued', data: { deductible_base_pct: 100, deductible_vat_pct: 100, ...(quarter !== 'auto' ? { fiscal_date: fiscalDateForQuarter(year, Number(quarter)) } : {}) }, warnings: [], reviewed: false } satisfies PdfExpenseDraft;
      }));
      if (!alive.current) return;
      setRows((current) => {
        const seen = new Set([...current.map((row) => row.hash), ...useExpensesStore.getState().expenses.map((expense) => expense.source_hash)]);
        const added = hashed.filter((row): row is NonNullable<typeof row> => row !== null && !seen.has(row.hash) && Boolean(seen.add(row.hash)));
        return [...current, ...added];
      });
    } catch { toast.error('No se pudieron abrir los archivos seleccionados.'); }
    finally { busyRef.current = false; if (alive.current) setBusy(false); }
  };

  const analyze = async () => {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true); cancelled.current = false;
    try {
      const { PdfExtractor } = await import('./lib/pdfExtraction');
      extractor.current = new PdfExtractor();
      for (const row of rows.filter((item) => item.status === 'queued' || item.status === 'error')) {
        if (cancelled.current || !alive.current) break;
        patch(row.id, { status: 'reading', error: undefined });
        try {
          const result = await extractor.current.extract(row.file, (message) => { if (alive.current) setProgress(`${row.file.name}: ${message}`); });
          if (cancelled.current || !alive.current) break;
          const data = { ...row.data, ...result.data };
          const identity = data.provider && data.invoice_number ? expenseIdentity({ provider: data.provider, invoice_number: data.invoice_number }) : null;
          const duplicate = identity && useExpensesStore.getState().expenses.some((expense) => expenseIdentity(expense) === identity);
          patch(row.id, { data, warnings: [...result.warnings, ...(duplicate ? ['Ya existe una factura con este proveedor y número.'] : [])], status: 'ready', reviewed: false });
        } catch (error) {
          patch(row.id, { status: 'error', error: cancelled.current ? 'Lectura detenida. Puedes reanudarla.' : error instanceof Error ? error.message : 'No se pudo leer el PDF.' });
        }
      }
    } finally {
      extractor.current?.dispose(); extractor.current = null; busyRef.current = false;
      if (alive.current) { setRows((current) => current.map((row) => row.status === 'reading' ? { ...row, status: 'queued' } : row)); setBusy(false); setProgress(''); }
    }
  };

  const save = async () => {
    if (busyRef.current || !userId) return;
    const owner = userId;
    busyRef.current = true; setBusy(true); cancelled.current = false;
    let count = 0;
    try {
      for (const row of rows.filter((item) => item.reviewed && item.status !== 'saved')) {
        if (cancelled.current || !alive.current || actor.current !== owner) break;
        const validated = expenseReviewSchema.safeParse(row.data);
        if (!validated.success || row.data.currency !== 'EUR') continue;
        setProgress(`Guardando ${row.file.name}…`);
        try {
          const expense = await apiClient.importExpensePdf(validated.data, row.file);
          if (actor.current !== owner || !alive.current) break;
          useExpensesStore.getState().addExpense(expense);
          patch(row.id, { status: 'saved', error: undefined }); count++;
        } catch (error) { patch(row.id, { status: 'error', reviewed: false, error: error instanceof Error ? error.message : 'No se pudo guardar.' }); }
      }
      if (count) toast.success(`${count} ${count === 1 ? 'gasto guardado' : 'gastos guardados'} con su PDF original.`);
    } finally { busyRef.current = false; if (alive.current) { setBusy(false); setProgress(''); } }
  };

  const ready = rows.filter((row) => row.status !== 'saved' && row.reviewed && row.data.currency === 'EUR' && expenseReviewSchema.safeParse(row.data).success).length;
  const pending = rows.filter((row) => row.status === 'queued' || row.status === 'error').length;
  return <div className="space-y-6">
    <PageHeader title="Importar PDF de gastos" actions={<Button variant="outline" asChild><Link href="/expenses"><ArrowLeft className="size-4" /> Volver a gastos</Link></Button>} />
    <p className="max-w-3xl text-sm text-muted-foreground">La lectura se realiza en este dispositivo, sin enviar las facturas a proveedores de IA. La primera vez se descarga el modelo. Los PDF se guardan en tu cuenta al confirmar los gastos.</p>
    <section className="space-y-5 rounded-xl border border-border p-5" aria-label="Seleccionar documentos">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2"><Label htmlFor="pdf-year">Año de imputación</Label><Input id="pdf-year" type="number" min="2000" max="2200" value={year} disabled={busy} onChange={(e) => setYear(Number(e.target.value))} className="w-28" /></div>
        <div className="space-y-2"><Label htmlFor="pdf-quarter">Trimestre de los documentos</Label><select id="pdf-quarter" className="h-10 max-w-full rounded-md border border-input bg-background px-3 text-sm" value={quarter} disabled={busy} onChange={(e) => setQuarter(e.target.value)}><option value="auto">Según la fecha de cada factura</option>{[1, 2, 3, 4].map((q) => <option key={q} value={q}>T{q}</option>)}</select></div>
        {quarter !== 'auto' && rows.length > 0 ? <Button variant="outline" disabled={busy || year < 2000 || year > 2200} onClick={() => setRows((current) => current.map((row) => row.status === 'saved' ? row : { ...row, data: { ...row.data, fiscal_date: fiscalDateForQuarter(year, Number(quarter)) }, reviewed: false }))}>Aplicar al lote</Button> : null}
      </div>
      <div className="rounded-lg border border-dashed border-border p-6 text-center" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); void selectFiles(Array.from(e.dataTransfer.files)); }}>
        <FileUp className="mx-auto mb-3 size-6 text-muted-foreground" aria-hidden="true" />
        <p className="mb-3 text-sm">Arrastra tus PDF o selecciónalos de una vez.</p>
        <input ref={input} type="file" multiple accept="application/pdf,.pdf" className="hidden" onChange={(e) => { void selectFiles(Array.from(e.target.files ?? [])); e.target.value = ''; }} />
        <Button variant="secondary" disabled={busy || !restored || year < 2000 || year > 2200} onClick={() => input.current?.click()}>Seleccionar PDF</Button>
        <p className="mt-3 text-xs text-muted-foreground">Hasta 3 MB por PDF y 50 documentos por lote. Los archivos repetidos se omiten.</p>
      </div>
      <div className="flex flex-wrap gap-3"><Button disabled={busy || pending === 0} onClick={() => void analyze()}>Leer {pending || ''} PDF con IA local</Button>
        <Button disabled={busy || ready === 0} onClick={() => void save()}>Guardar {ready || ''} gastos revisados</Button>
        {busy ? <Button variant="outline" onClick={() => { cancelled.current = true; extractor.current?.dispose(); }}>Detener</Button> : null}
        {!busy && rows.some((row) => row.status === 'saved') ? <Button variant="ghost" onClick={() => setRows((current) => current.filter((row) => row.status !== 'saved'))}>Quitar los guardados del lote</Button> : null}
      </div>
      <p role="status" aria-live="polite" className="break-words text-sm text-muted-foreground">{progress || (!restored ? 'Recuperando el lote…' : rows.length ? `${rows.length} documentos en el lote. El progreso se guarda en este navegador.` : 'Compatible con PDF de texto y facturas escaneadas. Puedes completar los datos manualmente si la IA no está disponible.')}</p>
    </section>
    <section aria-label="Revisar gastos">{rows.map((row) => <PdfExpenseReview key={row.id} row={row} disabled={busy} onChange={(changed) => patch(row.id, changed)} onRemove={() => setRows((current) => current.filter((item) => item.id !== row.id))} />)}</section>
  </div>;
}
