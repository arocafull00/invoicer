import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useConsultants, useCreateConsultant, useUpdateConsultant, useDeleteConsultant } from '@/shared/api/hooks';
import type { Consultant } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Spinner } from '@/shared/components/Spinner';
import { ConsultantFormFields, canSubmitConsultantFields } from '@/consultants/ConsultantFormFields';

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

  async function handleCreate() {
    if (!canSubmitConsultantFields(form)) return;
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
    } catch {
      toast.error('No se pudo crear el prestador del servicio');
    } finally {
      setPending(false);
    }
  }

  async function handleUpdate(id: string) {
    if (!canSubmitConsultantFields(form)) return;
    setPending(true);
    try {
      await updateMutation.mutateAsync({ id, consultant: { name: form.name!, email: form.email!, address: form.address!, city: form.city!, country: form.country!, nif: form.nif! } });
      setOpenEditId(null);
      setForm({});
    } catch {
      toast.error('No se pudo actualizar el prestador del servicio');
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMutation.mutateAsync(id);
      setConfirmDeleteId(null);
    } catch {
      toast.error('No se pudo eliminar el prestador del servicio');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Prestadores del servicio</h1>
          <p className="text-muted-foreground mt-1">Gestiona tus prestadores del servicio</p>
        </div>
        <Dialog open={openCreate} onOpenChange={(o: boolean) => { setOpenCreate(o); if (!o) setForm({}); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setForm({})}>
              <Plus className="w-4 h-4" />
              Añadir prestador del servicio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo prestador del servicio</DialogTitle>
            </DialogHeader>
            <ConsultantFormFields value={form} onChange={setForm} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenCreate(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={!canSubmitConsultantFields(form) || pending}>{pending ? 'Guardando...' : 'Guardar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className=" ">
        <div className="p-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email, ciudad, país o NIF"
              className="pl-9 bg-card border-border text-foreground placeholder:text-muted-foreground"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b border-border">
                  <TableHead className="text-left py-4 px-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">Nombre</TableHead>
                  <TableHead className="text-left py-4 px-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">Email</TableHead>
                  <TableHead className="text-left py-4 px-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">Ciudad</TableHead>
                  <TableHead className="text-left py-4 px-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">País</TableHead>
                  <TableHead className="text-left py-4 px-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">NIF</TableHead>
                  <TableHead className="text-right py-4 px-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow className="border-b border-border"><TableCell className="py-6 px-2" colSpan={6}><div className="flex justify-center py-2"><Spinner /></div></TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow className="border-b border-border"><TableCell className="py-6 px-2" colSpan={6}>No hay prestadores del servicio</TableCell></TableRow>
                ) : (
                  filtered.map((c) => (
                    <TableRow key={c.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                      <TableCell className="py-4 px-2">{c.name}</TableCell>
                      <TableCell className="py-4 px-2">{c.email}</TableCell>
                      <TableCell className="py-4 px-2">{c.city}</TableCell>
                      <TableCell className="py-4 px-2">{c.country}</TableCell>
                      <TableCell className="py-4 px-2">{c.nif}</TableCell>
                      <TableCell className="py-4 px-2 text-right">
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
                                <DialogTitle>Editar prestador del servicio</DialogTitle>
                              </DialogHeader>
                              <ConsultantFormFields value={form} onChange={setForm} />
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setOpenEditId(null)}>Cancelar</Button>
                                <Button onClick={() => handleUpdate(c.id)} disabled={!canSubmitConsultantFields(form) || pending}>{pending ? 'Guardando...' : 'Guardar'}</Button>
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
        </div>
      </Card>

      <AlertDialog open={!!confirmDeleteId} onOpenChange={(o: boolean) => !o && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar prestador del servicio</AlertDialogTitle>
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


