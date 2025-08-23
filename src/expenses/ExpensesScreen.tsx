import { useMemo, useState } from 'react';
import { 
  useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense,
  useExpenseTypes, useCreateExpenseType
} from '@/shared/api/hooks';
import type { Expense } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { ExpenseForm, type ExpenseFormValue } from './components/ExpenseForm';
import { Spinner } from '@/shared/components/Spinner';

export default function ExpensesPage() {
  const { data: expenses = [], isLoading } = useExpenses();
  const { data: expenseTypes = [] } = useExpenseTypes();
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();
  const createTypeMutation = useCreateExpenseType();

  const [search, setSearch] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [openEditId, setOpenEditId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState<ExpenseFormValue>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const normalized = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const filtered = useMemo(() => {
    const term = normalized(search);
    return expenses.filter((e) => !term || [
      e.invoice_number, e.provider, e.concept, e.expense_type?.name, e.date, String(e.base_amount), String(e.vat_amount), String(e.total)
    ].some((f) => normalized(String(f || '')).includes(term)));
  }, [expenses, search]);

  const canSubmit = (v: ExpenseFormValue) => !!(v.date && v.invoice_number && v.provider && v.concept && v.expense_type && (v.base_amount !== undefined) && (v.vat_amount !== undefined));

  async function handleCreate() {
    if (!canSubmit(form) || !form.expense_type) return;
    setPending(true);
    try {
      await createMutation.mutateAsync({
        date: form.date!,
        invoice_number: form.invoice_number!,
        provider: form.provider!,
        concept: form.concept!,
        base_amount: Number(form.base_amount || 0),
        vat_amount: Number(form.vat_amount || 0),
        total: Number(form.base_amount || 0) + Number(form.vat_amount || 0),
        expense_type: form.expense_type,
      } as Omit<Expense, 'id' | 'user_id'>);
      setOpenCreate(false);
      setForm({});
    } finally {
      setPending(false);
    }
  }

  async function handleUpdate(id: string) {
    if (!canSubmit(form) || !form.expense_type) return;
    setPending(true);
    try {
      await updateMutation.mutateAsync({ id, expense: {
        date: form.date!,
        invoice_number: form.invoice_number!,
        provider: form.provider!,
        concept: form.concept!,
        base_amount: Number(form.base_amount || 0),
        vat_amount: Number(form.vat_amount || 0),
        total: Number(form.base_amount || 0) + Number(form.vat_amount || 0),
        expense_type: form.expense_type,
      }});
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

  async function handleCreateType(name: string) {
    const created = await createTypeMutation.mutateAsync({ name });
    return created;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gastos</h1>
          <p className="text-[#A1A1AA] mt-1">Registra y controla tus gastos</p>
        </div>
        <Dialog open={openCreate} onOpenChange={(o: boolean) => { setOpenCreate(o); if (!o) setForm({}); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setForm({})}>
              <Plus className="w-4 h-4" />
              Añadir gasto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo gasto</DialogTitle>
            </DialogHeader>
            <ExpenseForm value={form} onChange={setForm} expenseTypes={expenseTypes} onCreateExpenseType={handleCreateType} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenCreate(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={!canSubmit(form) || pending}>{pending ? 'Guardando...' : 'Guardar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className=" ">
        <div className="p-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por proveedor, nº factura, concepto, fecha, importes o tipo"
              className="pl-9 bg-card border-[#FFFFFF14] text-white placeholder:text-[#A1A1AA]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b border-[#FFFFFF14]">
                  <TableHead className="text-left py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">Fecha</TableHead>
                  <TableHead className="text-left py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">Nº Factura</TableHead>
                  <TableHead className="text-left py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">Proveedor</TableHead>
                  <TableHead className="text-left py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">Concepto</TableHead>
                  <TableHead className="text-left py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">Tipo</TableHead>
                  <TableHead className="text-right py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">Base (€)</TableHead>
                  <TableHead className="text-right py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">IVA (€)</TableHead>
                  <TableHead className="text-right py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">Total (€)</TableHead>
                  <TableHead className="text-right py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow className="border-b border-[#FFFFFF14]"><TableCell className="py-6 px-2" colSpan={9}><div className="flex justify-center py-2"><Spinner /></div></TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow className="border-b border-[#FFFFFF14]"><TableCell className="py-6 px-2" colSpan={9}>No hay gastos</TableCell></TableRow>
                ) : (
                  filtered.map((e) => (
                    <TableRow key={e.id} className="border-b border-[#FFFFFF14] hover:bg-[#FFFFFF14]/30 transition-colors">
                      <TableCell className="py-4 px-2">{e.date}</TableCell>
                      <TableCell className="py-4 px-2">{e.invoice_number}</TableCell>
                      <TableCell className="py-4 px-2">{e.provider}</TableCell>
                      <TableCell className="py-4 px-2">{e.concept}</TableCell>
                      <TableCell className="py-4 px-2">{e.expense_type?.name || '-'}</TableCell>
                      <TableCell className="py-4 px-2 text-right">{e.base_amount.toFixed(2)}€</TableCell>
                      <TableCell className="py-4 px-2 text-right">{e.vat_amount.toFixed(2)}€</TableCell>
                      <TableCell className="py-4 px-2 text-right">{e.total.toFixed(2)}€</TableCell>
                      <TableCell className="py-4 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog open={openEditId === e.id} onOpenChange={(o: boolean) => { setOpenEditId(o ? e.id : null); setForm(o ? { ...e } : {} as ExpenseFormValue); }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Pencil className="size-4" />
                                Editar
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Editar gasto</DialogTitle>
                              </DialogHeader>
                              <ExpenseForm value={form} onChange={setForm} expenseTypes={expenseTypes} onCreateExpenseType={handleCreateType} />
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setOpenEditId(null)}>Cancelar</Button>
                                <Button onClick={() => handleUpdate(e.id)} disabled={!canSubmit(form) || pending}>{pending ? 'Guardando...' : 'Guardar'}</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button variant="destructive" size="sm" onClick={() => setConfirmDeleteId(e.id)}>
                            <Trash2 className="size-4" />
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      <AlertDialog open={!!confirmDeleteId} onOpenChange={(o: boolean) => !o && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar gasto</AlertDialogTitle>
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


