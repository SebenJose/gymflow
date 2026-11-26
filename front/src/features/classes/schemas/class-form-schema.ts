import { z } from 'zod';
import { toBusinessDateTime } from '@/lib/dates';

// Mesmos limites do `CreateClassDto` da API (`class-constraints.ts`).
const NAME_MAX = 80;
const DESCRIPTION_MAX = 500;
const MIN_DURATION = 10;
const MAX_DURATION = 240;
const MAX_CAPACITY = 200;

const integerField = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, 'Obrigatório')
    .pipe(
      z.coerce
        .number<string>()
        .int('Use um número inteiro')
        .min(min, `Mínimo ${min}`)
        .max(max, `Máximo ${max}`),
    );

export const classFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Informe o nome da aula')
      .max(NAME_MAX, `Máximo de ${NAME_MAX} caracteres`),
    description: z
      .string()
      .trim()
      .max(DESCRIPTION_MAX, `Máximo de ${DESCRIPTION_MAX} caracteres`)
      .transform((value) => (value === '' ? null : value)),
    /** Vazio: a API atribui a aula a quem cria, se for instrutor. */
    instructorId: z
      .union([z.uuid(), z.literal('')])
      .transform((value) => (value === '' ? undefined : value)),
    date: z.iso.date('Informe a data'),
    time: z.string().regex(/^\d{2}:\d{2}$/, 'Informe o horário'),
    durationMinutes: integerField(MIN_DURATION, MAX_DURATION),
    capacity: integerField(1, MAX_CAPACITY),
  })
  .transform(({ date, time, ...rest }) => ({ ...rest, startsAt: toBusinessDateTime(date, time) }));

export type ClassFormInput = z.input<typeof classFormSchema>;
export type ClassFormValues = z.output<typeof classFormSchema>;

export const rosterEntrySchema = z.object({
  id: z.string(),
  bookedAt: z.string(),
  attended: z.boolean().nullable(),
  student: z.object({ id: z.string(), name: z.string(), email: z.string() }),
});

export type RosterEntry = z.infer<typeof rosterEntrySchema>;

export const attendanceChangeSchema = z.object({
  classId: z.uuid(),
  bookingId: z.uuid(),
  attended: z.boolean(),
});
