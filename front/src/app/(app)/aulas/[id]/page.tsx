import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/page-header';
import { requireUser } from '@/features/auth';
import {
  ClassForm,
  ClassRoster,
  DeleteClassButton,
  fetchClass,
  fetchInstructors,
  fetchRoster,
  toClassFormInput,
} from '@/features/classes';
import { orNotFound } from '@/lib/api/or-not-found';

export const metadata: Metadata = { title: 'Gerenciar aula · gymflow' };

export default async function ManageClassPage({ params }: PageProps<'/aulas/[id]'>) {
  const user = await requireUser(['instructor', 'admin']);
  const { id } = await params;
  const gymClass = await orNotFound(fetchClass(id));
  const [roster, instructors] = await Promise.all([
    fetchRoster(gymClass.id),
    user.role === 'admin' ? fetchInstructors() : Promise.resolve(null),
  ]);
  const started = new Date(gymClass.startsAt) <= new Date();
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader title={gymClass.name} description="Chamada, dados da aula e remoção." />
      <ClassRoster classId={gymClass.id} entries={roster} started={started} />
      <ClassForm
        defaultValues={toClassFormInput(gymClass)}
        classId={gymClass.id}
        instructors={instructors}
      />
      <DeleteClassButton classId={gymClass.id} />
    </div>
  );
}
