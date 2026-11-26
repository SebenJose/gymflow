export enum UserRole {
  Student = 'student',
  Instructor = 'instructor',
  Admin = 'admin',
}

const USER_ROLES: readonly string[] = Object.values(UserRole);

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && USER_ROLES.includes(value);
}
