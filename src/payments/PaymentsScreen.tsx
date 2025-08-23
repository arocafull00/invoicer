import { useMemo, useState } from "react";
import {
  usePaymentInstructions,
  useUpdatePaymentInstruction,
  useDeletePaymentInstruction,
} from "@/shared/api/hooks";
import type { PaymentInstruction } from "@/shared/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Search } from "lucide-react";
import { PaymentInstructionForm } from "@/payments/components/PaymentInstructionForm";
import { Spinner } from "@/shared/components/Spinner";

export default function PaymentsPage() {
  const { data: paymentInstructions = [], isLoading } =
    usePaymentInstructions();
  const updateMutation = useUpdatePaymentInstruction();
  const deleteMutation = useDeletePaymentInstruction();

  const [search, setSearch] = useState("");
  const [openEditId, setOpenEditId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState<Partial<PaymentInstruction>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const normalized = (s: string) =>
    s
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();
  const filtered = useMemo(() => {
    const term = normalized(search);
    return paymentInstructions.filter(
      (p) =>
        !term ||
        [
          p.account_holder,
          p.iban,
          p.payment_method,
          p.payment_terms,
          p.additional_data,
        ].some((f) => normalized(String(f || "")).includes(term))
    );
  }, [paymentInstructions, search]);

  const canSubmit = (v: Partial<PaymentInstruction>) =>
    !!(v.account_holder && v.iban && v.payment_method && v.payment_terms);

  async function handleUpdate(id: string) {
    if (!canSubmit(form)) return;
    setPending(true);
    try {
      await updateMutation.mutateAsync({
        id,
        paymentInstruction: {
          account_holder: form.account_holder!,
          iban: form.iban!,
          payment_method: form.payment_method!,
          payment_terms: form.payment_terms!,
          additional_data: form.additional_data || "",
        },
      });
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
      <div>
        <h1 className="text-3xl font-bold text-white">Pagos</h1>
        <p className="text-[#A1A1AA] mt-1">
          Gestiona tus instrucciones de pago
        </p>
      </div>

      <Card className=" ">
        <div className="p-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por titular, IBAN, método, términos o exención"
              className="pl-9 bg-card border-[#FFFFFF14] text-white placeholder:text-[#A1A1AA]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b border-[#FFFFFF14]">
                  <TableHead className="text-left py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">Titular</TableHead>
                  <TableHead className="text-left py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">IBAN</TableHead>
                  <TableHead className="text-left py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">Método</TableHead>
                  <TableHead className="text-left py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">Términos</TableHead>
                  <TableHead className="text-left py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">Datos adicionales</TableHead>
                  <TableHead className="text-right py-4 px-2 text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow className="border-b border-[#FFFFFF14]">
                    <TableCell className="py-6 px-2" colSpan={6}>
                      <div className="flex justify-center py-2"><Spinner /></div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow className="border-b border-[#FFFFFF14]">
                    <TableCell className="py-6 px-2" colSpan={6}>
                      No hay instrucciones de pago
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((p) => (
                    <TableRow key={p.id} className="border-b border-[#FFFFFF14] hover:bg-[#FFFFFF14]/30 transition-colors">
                      <TableCell className="py-4 px-2">{p.account_holder}</TableCell>
                      <TableCell className="py-4 px-2">{p.iban}</TableCell>
                      <TableCell className="py-4 px-2">{p.payment_method}</TableCell>
                      <TableCell className="py-4 px-2">
                        <div className="max-w-[30ch] truncate" title={p.payment_terms || ""}>
                          {p.payment_terms}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-2">
                        <div className="max-w-[40ch] truncate" title={p.additional_data || ""}>
                          {p.additional_data}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog
                            open={openEditId === p.id}
                            onOpenChange={(o: boolean) => {
                              setOpenEditId(o ? p.id : null);
                              setForm(o ? p : {});
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Pencil className="size-4" />
                                Editar
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Editar instrucción de pago
                                </DialogTitle>
                              </DialogHeader>
                              <PaymentInstructionForm
                                value={form}
                                onChange={setForm}
                              />
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setOpenEditId(null)}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  onClick={() => handleUpdate(p.id)}
                                  disabled={!canSubmit(form) || pending}
                                >
                                  {pending ? "Guardando..." : "Guardar"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setConfirmDeleteId(p.id)}
                          >
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

      <AlertDialog
        open={!!confirmDeleteId}
        onOpenChange={(o: boolean) => !o && setConfirmDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar instrucción de pago</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                confirmDeleteId ? handleDelete(confirmDeleteId) : undefined
              }
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
