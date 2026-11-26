'use client';

import { ConfirmButton } from '@/components/ui/confirm-button';
import { errorMessageOf } from '@/lib/actions/action-message';
import { deleteWorkoutAction } from '../services/workout-staff-actions';

type DeleteWorkoutButtonProps = { workoutId: string };

export function DeleteWorkoutButton({ workoutId }: DeleteWorkoutButtonProps) {
  return (
    <ConfirmButton
      label="Remover ficha"
      warning="O histórico de exercícios do aluno é mantido, mas a ficha deixa de existir."
      onConfirm={() => errorMessageOf(deleteWorkoutAction(workoutId))}
    />
  );
}
