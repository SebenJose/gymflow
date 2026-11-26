'use client';

import { Button } from '@/components/ui/button';
import { useDeleteWorkout } from '../hooks/use-delete-workout';

type DeleteWorkoutButtonProps = { workoutId: string };

export function DeleteWorkoutButton({ workoutId }: DeleteWorkoutButtonProps) {
  const { confirming, pending, error, request, cancel } = useDeleteWorkout(workoutId);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={request} pending={pending} className="text-danger">
          {confirming ? 'Confirmar remoção' : 'Remover ficha'}
        </Button>
        {confirming && !pending && (
          <Button variant="ghost" onClick={cancel}>
            Cancelar
          </Button>
        )}
      </div>
      {confirming && (
        <p className="text-sm text-muted">
          O histórico de exercícios do aluno é mantido, mas a ficha deixa de existir.
        </p>
      )}
      {error !== undefined && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
