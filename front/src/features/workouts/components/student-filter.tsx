import { Button } from '@/components/ui/button';
import { SelectField } from '@/components/ui/select-field';
import type { Student } from '../schemas/student-schema';

type StudentFilterProps = { students: readonly Student[]; selected: string | undefined };

/** Formulário GET: o filtro vira `?aluno=` na URL e funciona sem JavaScript. */
export function StudentFilter({ students, selected }: StudentFilterProps) {
  const options = students.map(({ id, name }) => ({ value: id, label: name }));
  return (
    <form method="get" className="flex flex-wrap items-end gap-3">
      <div className="min-w-64">
        <SelectField
          label="Aluno"
          name="aluno"
          placeholder="Todos os alunos"
          options={options}
          defaultValue={selected ?? ''}
        />
      </div>
      <Button type="submit" variant="secondary">
        Filtrar
      </Button>
    </form>
  );
}
