import { useState } from 'react';
import { useIncomes, useCreateIncome, useUpdateIncome, useDeleteIncome, useClients } from '@/shared/api/hooks';
import type { Income } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus } from 'lucide-react';
import { IncomeForm, type IncomeFormValue } from './components/IncomeForm';
import { IncomeTable } from './components/IncomeTable';

export default function IncomesPage() {
  const { data: incomes = [], isLoading } = useIncomes();
  const { data: clients = [] } = useClients();
  const createMutation = useCreateIncome();
  const updateMutation = useUpdateIncome();
  const deleteMutation = useDeleteIncome();

  const [openCreate, setOpenCreate] = useState(false);
  const [openEditId, setOpenEditId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState<IncomeFormValue>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const canSubmit = (v: IncomeFormValue) => !!(v.date && v.concept && v.client && v.amount && v.amount > 0 && v.payment_method);

  async function handleCreate() {
    if (!canSubmit(form) || !form.client) return;
    setPending(true);
    try {
      await createMutation.mutateAsync({
        date: form.date!,
        concept: form.concept!,
        amount: form.amount!,
        payment_method: form.payment_method!,
        client: form.client,
      } as Omit<Income, 'id' | 'user_id'>);
      setOpenCreate(false);
      setForm({});
    } finally {
      setPending(false);
    }
  }

  async function handleUpdate(id: string) {
    if (!canSubmit(form) || !form.client) return;
    setPending(true);
    try {
      await updateMutation.mutateAsync({ id, income: { date: form.date!, concept: form.concept!, amount: form.amount!, payment_method: form.payment_method!, client: form.client } });
      setOpenEditId(null);
      setForm({});
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteMutation.mutateAsync(id);
    setConfirmDeleteId(null);
  }

  function handleEdit(income: Income) {
    setOpenEditId(income.id);
    setForm({ ...income });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ingresos</h1>
          <p className="text-muted-foreground mt-1">Añade ingresos extra asociados a clientes</p>
        </div>
        <Dialog open={openCreate} onOpenChange={(o: boolean) => { setOpenCreate(o); if (!o) setForm({}); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setForm({})}>
              <Plus className="w-4 h-4" />
              Añadir ingreso
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo ingreso</DialogTitle>
            </DialogHeader>
            <IncomeForm value={form} onChange={setForm} clients={clients} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenCreate(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={!canSubmit(form) || pending}>{pending ? 'Guardando...' : 'Guardar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <IncomeTable
        incomes={incomes}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={(id) => setConfirmDeleteId(id)}
      />

      <Dialog open={!!openEditId} onOpenChange={(o: boolean) => { if (!o) { setOpenEditId(null); setForm({}); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar ingreso</DialogTitle>
          </DialogHeader>
          <IncomeForm value={form} onChange={setForm} clients={clients} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditId(null)}>Cancelar</Button>
            <Button onClick={() => openEditId && handleUpdate(openEditId)} disabled={!canSubmit(form) || pending}>{pending ? 'Guardando...' : 'Guardar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDeleteId} onOpenChange={(o: boolean) => !o && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar ingreso</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDeleteId ? handleDelete(confirmDeleteId) : undefined}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
