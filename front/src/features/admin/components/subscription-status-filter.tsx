import { Button } from '@/components/ui/button';
import { SelectField } from '@/components/ui/select-field';
import type { SubscriptionStatus } from '@/features/plans';

type SubscriptionStatusFilterProps = { selected: SubscriptionStatus | undefined };

const OPTIONS = [
  { value: 'active', label: 'Ativas' },
  { value: 'suspended', label: 'Suspensas' },
  { value: 'cancelled', label: 'Canceladas' },
];

/** Formulário GET: o filtro vira `?situacao=` na URL e funciona sem JavaScript. */
export function SubscriptionStatusFilter({ selected }: SubscriptionStatusFilterProps) {
  return (
    <form method="get" className="flex flex-wrap items-end gap-3">
      <div className="min-w-48">
        <SelectField
          label="Situação"
          name="situacao"
          placeholder="Todas"
          options={OPTIONS}
          defaultValue={selected ?? ''}
        />
      </div>
      <Button type="submit" variant="secondary">
        Filtrar
      </Button>
    </form>
  );
}
