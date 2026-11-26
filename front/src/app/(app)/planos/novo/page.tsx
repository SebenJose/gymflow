import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/page-header';
import { EMPTY_PLAN_FORM, PlanForm } from '@/features/admin';
import { requireUser } from '@/features/auth';

export const metadata: Metadata = { title: 'Novo plano · gymflow' };

export default async function NewPlanPage() {
  await requireUser(['admin']);
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <PageHeader title="Novo plano" description="Defina preço, duração e disponibilidade." />
      <PlanForm defaultValues={EMPTY_PLAN_FORM} planId={null} />
    </div>
  );
}
