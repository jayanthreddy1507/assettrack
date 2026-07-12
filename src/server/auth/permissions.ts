export const ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "MANAGER",
  "TECHNICIAN",
  "EMPLOYEE",
  "AUDITOR",
] as const;

export type Role = (typeof ROLES)[number];

const roleRank: Record<Role, number> = {
  EMPLOYEE: 10,
  AUDITOR: 20,
  TECHNICIAN: 30,
  MANAGER: 40,
  ADMIN: 50,
  SUPER_ADMIN: 60,
};

export function hasRole(role: string | undefined, allowedRoles: Role[]) {
  if (!role) return false;
  return allowedRoles.includes(role as Role);
}

export function hasMinimumRole(role: string | undefined, minimumRole: Role) {
  if (!role) return false;
  return (roleRank[role as Role] ?? 0) >= roleRank[minimumRole];
}
