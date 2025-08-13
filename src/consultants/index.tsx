import { useMemo, useState } from 'react';
import { useConsultants, useCreateConsultant, useUpdateConsultant, useDeleteConsultant } from '@/shared/api/hooks';
import type { Consultant } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

function ConsultantForm({ value, onChange }: { value: Partial<Consultant>; onChange: (v: Partial<Consultant>) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" value={value.name || ''} onChange={(e) => onChange({ ...value, name: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={value.email || ''} onChange={(e) => onChange({ ...value, email: e.target.value })} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="address">Dirección</Label>
        <Input id="address" value={value.address || ''} onChange={(e) => onChange({ ...value, address: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="city">Ciudad</Label>
        <Input id="city" value={value.city || ''} onChange={(e) => onChange({ ...value, city: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="country">País</Label>
        <Input id="country" value={value.country || ''} onChange={(e) => onChange({ ...value, country: e.target.value })} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="nif">NIF</Label>
        <Input id="nif" value={value.nif || ''} onChange={(e) => onChange({ ...value, nif: e.target.value })} />
      </div>
    </div>
  );
}

export default function ConsultantsPage() {
  const { data: consultants = [], isLoading } = useConsultants();
  const createMutation = useCreateConsultant();
  const updateMutation = useUpdateConsultant();
  const deleteMutation = useDeleteConsultant();

  const [search, setSearch] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [openEditId, setOpenEditId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState<Partial<Consultant>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const normalized = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const filtered = useMemo(() => {
    const term = normalized(search);
    return consultants.filter((c) => !term || [c.name, c.email, c.city, c.country, c.nif].some((f) => normalized(String(f || '')).includes(term)));
  }, [consultants, search]);

  const canSubmit = (v: Partial<Consultant>) => !!(v.name && v.email && v.address && v.city && v.country && v.nif);

  async function handleCreate() {
    if (!canSubmit(form)) return;
    setPending(true);
    try {
      await createMutation.mutateAsync({
        name: form.name!,
        email: form.email!,
        address: form.address!,
        city: form.city!,
        country: form.country!,
        nif: form.nif!,
      });
      setOpenCreate(false);
      setForm({});
    } finally {
      setPending(false);
    }
  }

  async function handleUpdate(id: string) {
    if (!canSubmit(form)) return;
    setPending(true);
    try {
      await updateMutation.mutateAsync({ id, consultant: { name: form.name!, email: form.email!, address: form.address!, city: form.city!, country: form.country!, nif: form.nif! } });
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
          <h1 className="text-3xl font-bold text-white">Consultores</h1>
          <p className="text-[#A1A1AA] mt-1">Gestiona tus consultores</p>
        </div>
        <Dialog open={openCreate} onOpenChange={(o: boolean) => { setOpenCreate(o); if (!o) setForm({}); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setForm({})}>
              <Plus className="w-4 h-4" />
              Añadir consultor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo consultor</DialogTitle>
            </DialogHeader>
            <ConsultantForm value={form} onChange={setForm} />
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
          placeholder="Buscar por nombre, email, ciudad, país o NIF"
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
              <TableHead>NIF</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell className="py-6" colSpan={6}>Cargando...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell className="py-6" colSpan={6}>No hay consultores</TableCell></TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.city}</TableCell>
                  <TableCell>{c.country}</TableCell>
                  <TableCell>{c.nif}</TableCell>
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
                            <DialogTitle>Editar consultor</DialogTitle>
                          </DialogHeader>
                          <ConsultantForm value={form} onChange={setForm} />
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setOpenEditId(null)}>Cancelar</Button>
                            <Button onClick={() => handleUpdate(c.id)} disabled={!canSubmit(form) || pending}>{pending ? 'Guardando...' : 'Guardar'}</Button>
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
            <AlertDialogTitle>Eliminar consultor</AlertDialogTitle>
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


