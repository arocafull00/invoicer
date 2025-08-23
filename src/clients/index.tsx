import { useMemo, useState } from 'react';
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '@/shared/api/hooks';
import type { Client } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

function ClientForm({ value, onChange }: { value: Partial<Client>; onChange: (v: Partial<Client>) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre (Opcional)</Label>
        <Input id="name" value={value.name || ''} onChange={(e) => onChange({ ...value, name: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email (Opcional)</Label>
        <Input id="email" type="email" value={value.email || ''} onChange={(e) => onChange({ ...value, email: e.target.value })} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="address">Dirección (Opcional)</Label>
        <Input id="address" value={value.address || ''} onChange={(e) => onChange({ ...value, address: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="city">Ciudad (Opcional)</Label>
        <Input id="city" value={value.city || ''} onChange={(e) => onChange({ ...value, city: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="country">País (Opcional)</Label>
        <Input id="country" value={value.country || ''} onChange={(e) => onChange({ ...value, country: e.target.value })} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="company_number">Número de empresa (Opcional)</Label>
        <Input id="company_number" value={value.company_number || ''} onChange={(e) => onChange({ ...value, company_number: e.target.value })} />
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const { data: clients = [], isLoading } = useClients();
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const deleteMutation = useDeleteClient();

  const [search, setSearch] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [openEditId, setOpenEditId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState<Partial<Client>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const normalized = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const filtered = useMemo(() => {
    const term = normalized(search);
    return clients.filter((c) => !term || [c.name, c.email, c.city, c.country, c.company_number].some((f) => normalized(String(f || '')).includes(term)));
  }, [clients, search]);

  const canSubmit = (_v: Partial<Client>) => true;

  async function handleCreate() {
    setPending(true);
    try {
      await createMutation.mutateAsync({ ...form });
      setOpenCreate(false);
      setForm({});
    } finally {
      setPending(false);
    }
  }

  async function handleUpdate(id: string) {
    setPending(true);
    try {
      await updateMutation.mutateAsync({ id, client: { ...form } });
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
          <h1 className="text-3xl font-bold text-white">Clientes</h1>
          <p className="text-[#A1A1AA] mt-1">Gestiona tus clientes</p>
        </div>
        <Dialog open={openCreate} onOpenChange={(o: boolean) => { setOpenCreate(o); if (!o) setForm({}); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setForm({})}>
              <Plus className="w-4 h-4" />
              Añadir cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo cliente</DialogTitle>
            </DialogHeader>
            <ClientForm value={form} onChange={setForm} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenCreate(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={pending}>{pending ? 'Guardando...' : 'Guardar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, email, ciudad, país o número de empresa"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-card border border-border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead>País</TableHead>
              <TableHead>N.º empresa</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell className="py-6" colSpan={6}>Cargando...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell className="py-6" colSpan={6}>No hay clientes</TableCell></TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.name || '-'}</TableCell>
                  <TableCell>{c.email || '-'}</TableCell>
                  <TableCell>{c.city || '-'}</TableCell>
                  <TableCell>{c.country || '-'}</TableCell>
                  <TableCell>{c.company_number || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Dialog open={openEditId === c.id} onOpenChange={(o: boolean) => { setOpenEditId(o ? c.id : null); setForm(o ? c : {}); }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Pencil className="size-4" />
                            Editar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar cliente</DialogTitle>
                          </DialogHeader>
                          <ClientForm value={form} onChange={setForm} />
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setOpenEditId(null)}>Cancelar</Button>
                            <Button onClick={() => handleUpdate(c.id)} disabled={pending}>{pending ? 'Guardando...' : 'Guardar'}</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button variant="destructive" size="sm" onClick={() => setConfirmDeleteId(c.id)}>
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
            <AlertDialogTitle>Eliminar cliente</AlertDialogTitle>
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


