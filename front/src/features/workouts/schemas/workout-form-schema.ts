import { z } from 'zod';

// Mesmos limites dos DTOs de fichas da API (`workout-constraints.ts`).
const WORKOUT_NAME_MAX = 80;
const WORKOUT_NOTES_MAX = 500;
const WORKOUT_MAX_EXERCISES = 30;
const EXERCISE_NAME_MAX = 80;
const EXERCISE_NOTES_MAX = 200;
const MAX_SETS = 20;
const MAX_REPS = 100;
const MAX_LOAD_KG = 1000;
const MAX_REST_SECONDS = 600;

/** Os inputs numéricos chegam como texto; vazio vira `null` nos campos opcionais. */
const requiredInteger = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `Informe ${label}`)
    .pipe(
      z.coerce
        .number<string>()
        .int(`Use um número inteiro`)
        .min(1, 'Mínimo 1')
        .max(max, `Máximo ${max}`),
    );

const optionalNumber = (max: number, integer: boolean) =>
  z
    .string()
    .trim()
    .transform((value) => (value === '' ? null : Number(value)))
    .pipe(
      z
        .number('Use um número')
        .min(0, 'Não pode ser negativo')
        .max(max, `Máximo ${max}`)
        .refine((value) => !integer || Number.isInteger(value), 'Use um número inteiro')
        .nullable(),
    );

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo de ${max} caracteres`)
    .transform((value) => (value === '' ? null : value));

export const exerciseFormSchema = z.object({
  /** Presente nos exercícios que já existem na ficha (edição). Não é `id` porque o
   * `useFieldArray` usa essa chave para controle interno. */
  exerciseId: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(1, 'Informe o exercício')
    .max(EXERCISE_NAME_MAX, `Máximo de ${EXERCISE_NAME_MAX} caracteres`),
  sets: requiredInteger('as séries', MAX_SETS),
  reps: requiredInteger('as repetições', MAX_REPS),
  loadKg: optionalNumber(MAX_LOAD_KG, false),
  restSeconds: optionalNumber(MAX_REST_SECONDS, true),
  notes: optionalText(EXERCISE_NOTES_MAX),
});

export const workoutFormSchema = z.object({
  studentId: z.uuid('Selecione um aluno'),
  name: z
    .string()
    .trim()
    .min(1, 'Informe o nome da ficha')
    .max(WORKOUT_NAME_MAX, `Máximo de ${WORKOUT_NAME_MAX} caracteres`),
  notes: optionalText(WORKOUT_NOTES_MAX),
  exercises: z
    .array(exerciseFormSchema)
    .min(1, 'Adicione pelo menos 1 exercício')
    .max(WORKOUT_MAX_EXERCISES, `A ficha pode ter no máximo ${WORKOUT_MAX_EXERCISES} exercícios`),
});

/** Valores do formulário (texto). */
export type WorkoutFormInput = z.input<typeof workoutFormSchema>;
/** Valores já validados e convertidos, prontos para a API. */
export type WorkoutFormValues = z.output<typeof workoutFormSchema>;
export type ExerciseFormValues = z.output<typeof exerciseFormSchema>;

export const EMPTY_EXERCISE: z.input<typeof exerciseFormSchema> = {
  name: '',
  sets: '3',
  reps: '12',
  loadKg: '',
  restSeconds: '',
  notes: '',
};
