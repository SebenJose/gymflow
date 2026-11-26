import { Card } from '@/components/ui/card';
import type { RosterEntry } from '../schemas/class-form-schema';
import { RosterRow } from './roster-row';

type ClassRosterProps = { classId: string; entries: readonly RosterEntry[]; started: boolean };

export function ClassRoster({ classId, entries, started }: ClassRosterProps) {
  return (
    <Card className="flex flex-col gap-2">
      <h2 className="font-medium">Inscritos ({entries.length})</h2>
      {!started && (
        <p className="text-sm text-muted">
          A presença pode ser registrada depois que a aula começar.
        </p>
      )}
      {entries.length === 0 ? (
        <p className="text-sm text-muted">Nenhum aluno inscrito.</p>
      ) : (
        <ul className="divide-y">
          {entries.map((entry) => (
            <RosterRow key={entry.id} classId={classId} entry={entry} canMark={started} />
          ))}
        </ul>
      )}
    </Card>
  );
}
