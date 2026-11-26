import type { Exercise } from '../schemas/workout-schema';

/** Ex.: "4 × 10 · 30 kg · descanso 90 s". */
export function describePrescription({ sets, reps, loadKg, restSeconds }: Exercise): string {
  const parts = [`${sets} × ${reps}`];
  if (loadKg !== null) {
    parts.push(`${loadKg.toLocaleString('pt-BR')} kg`);
  }
  if (restSeconds !== null) {
    parts.push(`descanso ${restSeconds} s`);
  }
  return parts.join(' · ');
}
