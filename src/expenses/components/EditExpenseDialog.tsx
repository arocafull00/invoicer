import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ExpenseFields } from './ExpenseFields';
import { expenseInputSchema, type ExpenseInput } from '../lib/expenseValidation';
import { useExpensesStore } from '../store/useExpensesStore';
import { apiClient } from '@/shared/api/client';
import type { Expense } from '@/shared/types';

export function EditExpenseDialog({ expense }: { expense: Expense }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [value, setValue] = useState<Partial<ExpenseInput>>({});
  const validated = expenseInputSchema.safeParse(value);
  const save = async () => {
    if (!validated.success) return;
    setPending(true); setError('');
    try {
      const updated = await apiClient.updateExpense(expense.id, validated.data);
      useExpensesStore.getState().updateExpense(updated);
      setOpen(false); toast.success('Gasto actualizado');
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo guardar el gasto'); }
    finally { setPending(false); }
  };
  return <>
    <Button size="icon" variant="ghost" aria-label={`Editar gasto de ${expense.provider}`} onClick={() => {
      setValue({ ...expense, fiscal_date: expense.fiscal_date ?? expense.date, currency: 'EUR', retention_amount: expense.retention_amount ?? 0, deductible_base_pct: expense.deductible_base_pct ?? 100, deductible_vat_pct: expense.deductible_vat_pct ?? 100 }); setError(''); setOpen(true);
    }}><Pencil className="size-4" /></Button>
    <Dialog open={open} onOpenChange={(next) => { if (!pending) setOpen(next); }}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle>Editar gasto</DialogTitle></DialogHeader>
      <ExpenseFields value={value} onChange={setValue} prefix={`edit-${expense.id}`} disabled={pending} />
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      {!validated.success ? <p className="text-sm text-destructive">{[...new Set(validated.error.issues.map((issue) => issue.message))].join('. ')}</p> : null}
      <DialogFooter><Button variant="outline" disabled={pending} onClick={() => setOpen(false)}>Cancelar</Button><Button disabled={pending || !validated.success} onClick={() => void save()}>{pending ? 'Guardando…' : 'Guardar cambios'}</Button></DialogFooter>
    </DialogContent></Dialog>
  </>;
}
