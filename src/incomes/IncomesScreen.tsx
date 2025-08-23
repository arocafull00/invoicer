import { useMemo, useState } from 'react';
import { useIncomes, useCreateIncome, useUpdateIncome, useDeleteIncome, useClients } from '@/shared/api/hooks';
import type { Income } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { IncomeForm, type IncomeFormValue } from './components/IncomeForm';
import { Spinner } from '@/shared/components/Spinner';


export default function IncomesPage() {
  const { data: incomes = [], isLoading } = useIncomes();
  const { data: clients = [] } = useClients();
  const createMutation = useCreateIncome();
  const updateMutation = useUpdateIncome();
  const deleteMutation = useDeleteIncome();

  const [search, setSearch] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [openEditId, setOpenEditId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState<IncomeFormValue>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const normalized = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const filtered = useMemo(() => {
    const term = normalized(search);
    return incomes.filter((i) => !term || [i.concept, i.client?.name, i.payment_method, i.date, String(i.amount)].some((f) => normalized(String(f || '')).includes(term)));
  }, [incomes, search]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Ingresos</h1>
          <p className="text-[#A1A1AA] mt-1">Añade ingresos extra asociados a clientes</p>
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

      <Card className=" ">
        <div className="p-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por concepto, cliente, fecha, importe o forma de pago"
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
                  <TableHead className="text-left py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">Concepto</TableHead>
                  <TableHead className="text-left py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">Cliente</TableHead>
                  <TableHead className="text-left py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">Forma de pago</TableHead>
                  <TableHead className="text-right py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">Importe</TableHead>
                  <TableHead className="text-right py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow className="border-b border-[#FFFFFF14]"><TableCell className="py-6 px-2" colSpan={6}><div className="flex justify-center py-2"><Spinner /></div></TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow className="border-b border-[#FFFFFF14]"><TableCell className="py-6 px-2" colSpan={6}>No hay ingresos</TableCell></TableRow>
                ) : (
                  filtered.map((i) => (
                    <TableRow key={i.id} className="border-b border-[#FFFFFF14] hover:bg-[#FFFFFF14]/30 transition-colors">
                      <TableCell className="py-4 px-2">{i.date}</TableCell>
                      <TableCell className="py-4 px-2">{i.concept}</TableCell>
                      <TableCell className="py-4 px-2">{i.client?.name || '-'}</TableCell>
                      <TableCell className="py-4 px-2">
                        {i.payment_method === 'cash' ? 'Efectivo' : i.payment_method === 'transfer' ? 'Transferencia' : 'Bizum'}
                      </TableCell>
                      <TableCell className="py-4 px-2 text-right">{i.amount.toFixed(2)}€</TableCell>
                      <TableCell className="py-4 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog open={openEditId === i.id} onOpenChange={(o: boolean) => { setOpenEditId(o ? i.id : null); setForm(o ? { ...i } : {} as IncomeFormValue); }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Pencil className="size-4" />
                                Editar
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Editar ingreso</DialogTitle>
                              </DialogHeader>
                              <IncomeForm value={form} onChange={setForm} clients={clients} />
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setOpenEditId(null)}>Cancelar</Button>
                                <Button onClick={() => handleUpdate(i.id)} disabled={!canSubmit(form) || pending}>{pending ? 'Guardando...' : 'Guardar'}</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button variant="destructive" size="sm" onClick={() => setConfirmDeleteId(i.id)}>
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




