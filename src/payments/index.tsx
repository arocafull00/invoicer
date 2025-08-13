import { useMemo, useState } from 'react';
import { usePaymentInstructions, useUpdatePaymentInstruction, useDeletePaymentInstruction } from '@/shared/api/hooks';
import type { PaymentInstruction } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Search } from 'lucide-react';

function PaymentInstructionForm({ value, onChange }: { value: Partial<PaymentInstruction>; onChange: (v: Partial<PaymentInstruction>) => void }) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div className="space-y-2 md:col-span-2">
				<Label htmlFor="account_holder">Titular de la cuenta</Label>
				<Input id="account_holder" value={value.account_holder || ''} onChange={(e) => onChange({ ...value, account_holder: e.target.value })} />
			</div>
			<div className="space-y-2 md:col-span-2">
				<Label htmlFor="iban">IBAN</Label>
				<Input id="iban" value={value.iban || ''} onChange={(e) => onChange({ ...value, iban: e.target.value })} />
			</div>
			<div className="space-y-2">
				<Label htmlFor="payment_method">Método de pago</Label>
				<Input id="payment_method" value={value.payment_method || ''} onChange={(e) => onChange({ ...value, payment_method: e.target.value })} />
			</div>
			<div className="space-y-2">
				<Label htmlFor="payment_terms">Términos de pago</Label>
				<Input id="payment_terms" value={value.payment_terms || ''} onChange={(e) => onChange({ ...value, payment_terms: e.target.value })} />
			</div>
			<div className="space-y-2 md:col-span-2">
				<Label htmlFor="additional_data">Datos adicionales</Label>
				<Input id="additional_data" value={value.additional_data || ''} onChange={(e) => onChange({ ...value, additional_data: e.target.value })} />
			</div>
		</div>
	);
}

export default function PaymentsPage() {
	const { data: paymentInstructions = [], isLoading } = usePaymentInstructions();
	const updateMutation = useUpdatePaymentInstruction();
	const deleteMutation = useDeletePaymentInstruction();

	const [search, setSearch] = useState('');
	const [openEditId, setOpenEditId] = useState<string | null>(null);
	const [pending, setPending] = useState(false);
	const [form, setForm] = useState<Partial<PaymentInstruction>>({});
	const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

	const normalized = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
	const filtered = useMemo(() => {
		const term = normalized(search);
		return paymentInstructions.filter((p) => !term || [
			p.account_holder,
			p.iban,
			p.payment_method,
			p.payment_terms,
			p.additional_data,
		].some((f) => normalized(String(f || '')).includes(term)));
	}, [paymentInstructions, search]);

	const canSubmit = (v: Partial<PaymentInstruction>) => !!(v.account_holder && v.iban && v.payment_method && v.payment_terms);

	async function handleUpdate(id: string) {
		if (!canSubmit(form)) return;
		setPending(true);
		try {
			await updateMutation.mutateAsync({ id, paymentInstruction: {
				account_holder: form.account_holder!,
				iban: form.iban!,
				payment_method: form.payment_method!,
				payment_terms: form.payment_terms!,
				additional_data: form.additional_data || '',
			} });
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
				<p className="text-[#A1A1AA] mt-1">Gestiona tus instrucciones de pago</p>
			</div>

			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
				<Input
					placeholder="Buscar por titular, IBAN, método, términos o exención"
					className="pl-9"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			</div>

			<div className="bg-card border border-border rounded-lg">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Titular</TableHead>
							<TableHead>IBAN</TableHead>
							<TableHead>Método</TableHead>
							<TableHead>Términos</TableHead>
							<TableHead>Datos adicionales</TableHead>
							<TableHead className="text-right">Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow><TableCell className="py-6" colSpan={6}>Cargando...</TableCell></TableRow>
						) : filtered.length === 0 ? (
							<TableRow><TableCell className="py-6" colSpan={6}>No hay instrucciones de pago</TableCell></TableRow>
						) : (
							filtered.map((p) => (
								<TableRow key={p.id}>
									<TableCell>{p.account_holder}</TableCell>
									<TableCell>{p.iban}</TableCell>
									<TableCell>{p.payment_method}</TableCell>
									<TableCell>{p.payment_terms}</TableCell>
												<TableCell>{p.additional_data}</TableCell>
									<TableCell className="text-right">
										<div className="flex items-center justify-end gap-2">
						<Dialog open={openEditId === p.id} onOpenChange={(o: boolean) => { setOpenEditId(o ? p.id : null); setForm(o ? p : {}); }}>
												<DialogTrigger asChild>
													<Button variant="outline" size="sm">
														<Pencil className="size-4" />
														Editar
													</Button>
												</DialogTrigger>
												<DialogContent>
													<DialogHeader>
														<DialogTitle>Editar instrucción de pago</DialogTitle>
													</DialogHeader>
													<PaymentInstructionForm value={form} onChange={setForm} />
													<DialogFooter>
														<Button variant="outline" onClick={() => setOpenEditId(null)}>Cancelar</Button>
														<Button onClick={() => handleUpdate(p.id)} disabled={!canSubmit(form) || pending}>{pending ? 'Guardando...' : 'Guardar'}</Button>
													</DialogFooter>
												</DialogContent>
											</Dialog>
											<Button variant="destructive" size="sm" onClick={() => setConfirmDeleteId(p.id)}>
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
						<AlertDialogTitle>Eliminar instrucción de pago</AlertDialogTitle>
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


