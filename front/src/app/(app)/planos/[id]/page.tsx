import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/page-header';
import { DeletePlanButton, fetchPlan, PlanForm, toPlanFormInput } from '@/features/admin';
import { requireUser } from '@/features/auth';
import { orNotFound } from '@/lib/api/or-not-found';

export const metadata: Metadata = { title: 'Editar plano · gymflow' };

export default async function EditPlanPage({ params }: PageProps<'/planos/[id]'>) {
  await requireUser(['admin']);
  const { id } = await params;
  const plan = await orNotFound(fetchPlan(id));
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <PageHeader
        title={plan.name}
        description="Mudar o preço não altera as matrículas já contratadas."
      />
      <PlanForm defaultValues={toPlanFormInput(plan)} planId={plan.id} />
      <DeletePlanButton planId={plan.id} />
    </div>
  );
}
