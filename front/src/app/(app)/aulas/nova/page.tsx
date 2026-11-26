import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/page-header';
import { requireUser } from '@/features/auth';
import { ClassForm, EMPTY_CLASS_FORM, fetchInstructors } from '@/features/classes';

export const metadata: Metadata = { title: 'Nova aula · gymflow' };

export default async function NewClassPage() {
  const user = await requireUser(['instructor', 'admin']);
  // Só o admin escolhe o instrutor; a aula criada por um instrutor fica com ele.
  const instructors = user.role === 'admin' ? await fetchInstructors() : null;
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader title="Nova aula" description="Agende uma aula coletiva e defina as vagas." />
      <ClassForm defaultValues={EMPTY_CLASS_FORM} classId={null} instructors={instructors} />
    </div>
  );
}
