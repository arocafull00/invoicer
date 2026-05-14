import type { Consultant } from '@/shared/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function canSubmitConsultantFields(v: Partial<Consultant>) {
  return !!(v.name && v.email && v.address && v.city && v.country && v.nif);
}

export function ConsultantFormFields({
  value,
  onChange,
}: {
  value: Partial<Consultant>;
  onChange: (v: Partial<Consultant>) => void;
}) {
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
