import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { UserCog } from 'lucide-react';
import { useCreateConsultant } from '@/shared/api/hooks';
import type { Consultant } from '@/shared/types';
import { ConsultantFormFields, canSubmitConsultantFields } from '@/consultants/ConsultantFormFields';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ConsultantOnboardingScreen() {
  const navigate = useNavigate();
  const createMutation = useCreateConsultant();
  const [form, setForm] = useState<Partial<Consultant>>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit() {
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
      navigate('/dashboard', { replace: true });
    } catch {
      toast.error('No se pudieron guardar tus datos');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/20 text-primary">
          <UserCog className="size-8" aria-hidden />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Configura tu cuenta</h1>
        <p className="text-muted-foreground max-w-md">
          Añade tus datos para que aparezcan como emisor en tus facturas.
        </p>
      </div>

      <Card className="p-6 md:p-8 border-border bg-card/80 backdrop-blur-sm">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Tus datos de facturación</h2>
            <p className="text-sm text-muted-foreground mt-1">Podrás editarlos o añadir otros perfiles de emisor más adelante.</p>
          </div>
          <ConsultantFormFields value={form} onChange={setForm} />
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={handleSubmit}
            disabled={!canSubmitConsultantFields(form) || pending}
          >
            {pending ? 'Guardando…' : 'Continuar'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
