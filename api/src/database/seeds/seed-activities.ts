import type { SeedUserKey } from './seed-data.js';

type SeedExercise = {
  name: string;
  sets: number;
  reps: number;
  loadKg?: number;
  restSeconds?: number;
};

export const SEED_WORKOUTS: readonly {
  student: SeedUserKey;
  instructor: SeedUserKey;
  name: string;
  notes?: string;
  exercises: readonly SeedExercise[];
  /** Exercícios (por posição) concluídos em cada um dos dias anteriores a hoje. */
  completedDaysAgo: readonly { daysAgo: number; positions: readonly number[] }[];
}[] = [
  {
    student: 'ana',
    instructor: 'carla',
    name: 'Treino A — Superiores',
    notes: 'Foco em técnica; aumentar a carga quando completar as séries com folga.',
    exercises: [
      { name: 'Supino reto', sets: 4, reps: 10, loadKg: 30, restSeconds: 90 },
      { name: 'Remada curvada', sets: 4, reps: 10, loadKg: 25, restSeconds: 90 },
      { name: 'Desenvolvimento com halteres', sets: 3, reps: 12, loadKg: 8, restSeconds: 60 },
      { name: 'Prancha (segundos)', sets: 3, reps: 40 },
    ],
    completedDaysAgo: [
      { daysAgo: 2, positions: [0, 1, 2, 3] },
      { daysAgo: 4, positions: [0, 1] },
    ],
  },
  {
    student: 'ana',
    instructor: 'carla',
    name: 'Treino B — Inferiores',
    exercises: [
      { name: 'Agachamento livre', sets: 4, reps: 10, loadKg: 40, restSeconds: 120 },
      { name: 'Leg press', sets: 4, reps: 12, loadKg: 120, restSeconds: 90 },
      { name: 'Cadeira flexora', sets: 3, reps: 12, loadKg: 30, restSeconds: 60 },
    ],
    completedDaysAgo: [{ daysAgo: 1, positions: [0, 1, 2] }],
  },
  {
    student: 'bruno',
    instructor: 'rafael',
    name: 'Adaptação',
    exercises: [
      { name: 'Esteira (minutos)', sets: 1, reps: 15 },
      { name: 'Puxada frontal', sets: 3, reps: 12, loadKg: 35, restSeconds: 60 },
      { name: 'Cadeira extensora', sets: 3, reps: 12, loadKg: 25, restSeconds: 60 },
    ],
    completedDaysAgo: [{ daysAgo: 1, positions: [0, 1] }],
  },
];

/** `attended` só vale para aulas no passado; `null` = presença ainda não registrada. */
export const SEED_CLASSES: readonly {
  name: string;
  description: string;
  instructor: SeedUserKey;
  inDays: number;
  time: string;
  durationMinutes: number;
  capacity: number;
  bookings: readonly { student: SeedUserKey; attended: boolean | null }[];
}[] = [
  {
    name: 'Spinning',
    description: 'Ciclismo indoor em ritmo de intervalos.',
    instructor: 'rafael',
    inDays: -3,
    time: '07:00',
    durationMinutes: 45,
    capacity: 15,
    bookings: [
      { student: 'ana', attended: true },
      { student: 'bruno', attended: false },
    ],
  },
  {
    name: 'Yoga',
    description: 'Mobilidade, respiração e equilíbrio.',
    instructor: 'carla',
    inDays: -1,
    time: '18:30',
    durationMinutes: 60,
    capacity: 12,
    bookings: [
      { student: 'ana', attended: true },
      { student: 'bruno', attended: null },
    ],
  },
  {
    name: 'Funcional',
    description: 'Circuito com peso corporal e kettlebell.',
    instructor: 'rafael',
    inDays: 1,
    time: '07:00',
    durationMinutes: 50,
    capacity: 20,
    bookings: [{ student: 'ana', attended: null }],
  },
  {
    // Lotada, para mostrar o bloqueio de inscrição.
    name: 'Pilates',
    description: 'Turma reduzida, com aparelhos.',
    instructor: 'carla',
    inDays: 2,
    time: '19:00',
    durationMinutes: 50,
    capacity: 2,
    bookings: [
      { student: 'ana', attended: null },
      { student: 'bruno', attended: null },
    ],
  },
  {
    name: 'Spinning',
    description: 'Ciclismo indoor em ritmo de intervalos.',
    instructor: 'rafael',
    inDays: 3,
    time: '18:00',
    durationMinutes: 45,
    capacity: 15,
    bookings: [],
  },
];
