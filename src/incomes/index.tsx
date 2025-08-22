import { useMemo, useState } from 'react';
import { useIncomes, useCreateIncome, useUpdateIncome, useDeleteIncome, useClients } from '@/shared/api/hooks';
import type { Income, Client, IncomePaymentMethod } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

type IncomeFormValue = Partial<Omit<Income, 'id' | 'user_id'>> & { client?: Client };

function IncomeForm({ value, onChange, clients }: { value: IncomeFormValue; onChange: (v: IncomeFormValue) => void; clients: Client[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="date">Fecha</Label>
        <Input id="date" type="date" value={value.date || ''} onChange={(e) => onChange({ ...value, date: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Precio</Label>
        <Input id="amount" type="number" step="0.01" value={value.amount?.toString() || ''} onChange={(e) => onChange({ ...value, amount: Number(e.target.value) })} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="concept">Concepto</Label>
        <Input id="concept" value={value.concept || ''} onChange={(e) => onChange({ ...value, concept: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Cliente</Label>
        <Select value={value.client?.id || ''} onValueChange={(id) => onChange({ ...value, client: clients.find((c) => c.id === id) })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona cliente" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Forma de pago</Label>
        <Select value={(value.payment_method as string) || ''} onValueChange={(v: IncomePaymentMethod) => onChange({ ...value, payment_method: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona forma de pago" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Efectivo</SelectItem>
            <SelectItem value="transfer">Transferencia</SelectItem>
            <SelectItem value="bizum">Bizum</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por concepto, cliente, fecha, importe o forma de pago"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-card border border-border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Forma de pago</TableHead>
              <TableHead className="text-right">Importe</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell className="py-6" colSpan={6}>Cargando...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell className="py-6" colSpan={6}>No hay ingresos</TableCell></TableRow>
            ) : (
              filtered.map((i) => (
                <TableRow key={i.id}>
                  <TableCell>{i.date}</TableCell>
                  <TableCell>{i.concept}</TableCell>
                  <TableCell>{i.client?.name || '-'}</TableCell>
                  <TableCell>
                    {i.payment_method === 'cash' ? 'Efectivo' : i.payment_method === 'transfer' ? 'Transferencia' : 'Bizum'}
                  </TableCell>
                  <TableCell className="text-right">{i.amount.toFixed(2)}€</TableCell>
                  <TableCell className="text-right">
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




