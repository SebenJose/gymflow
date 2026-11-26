// Inclui funções de servidor (`server-only`): importe este index só em Server Components.
export { DeleteWorkoutButton } from './components/delete-workout-button';
export { StaffWorkoutList } from './components/staff-workout-list';
export { StudentFilter } from './components/student-filter';
export { WorkoutForm } from './components/workout-form';
export { WorkoutList } from './components/workout-list';
export type { Completion } from './schemas/completion-schema';
export { EMPTY_EXERCISE } from './schemas/workout-form-schema';
export { toWorkoutFormInput } from './services/workout-form-values';
export {
  fetchMyCompletions,
  fetchMyWorkouts,
  fetchStudents,
  fetchWorkout,
  fetchWorkouts,
} from './services/workouts-api';
