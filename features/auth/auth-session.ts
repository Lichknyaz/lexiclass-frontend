export type UserRole = "teacher" | "student";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LocalUserInput {
  name: string;
  email: string;
  role: UserRole;
}

export type RouteAccessDecision =
  | {
      allowed: true;
    }
  | {
      allowed: false;
      redirectTo: string;
    };

const AUTH_STORAGE_KEY = "lexiclass-auth-user";

export function getRoleHome(role: UserRole) {
  return role === "teacher" ? "/teacher/dashboard" : "/student/dashboard";
}

export function createLocalUser({ name, email, role }: LocalUserInput): AuthUser {
  const normalizedEmail = email.trim().toLowerCase();
  const fallbackName = normalizedEmail.split("@")[0] || role;

  return {
    id: `${role}-${normalizedEmail}`,
    name: name.trim() || fallbackName,
    email: normalizedEmail,
    role,
  };
}

export function getRouteAccessDecision(
  user: AuthUser | null,
  requiredRole: UserRole,
): RouteAccessDecision {
  if (!user) {
    return {
      allowed: false,
      redirectTo: "/login",
    };
  }

  if (user.role !== requiredRole) {
    return {
      allowed: false,
      redirectTo: getRoleHome(user.role),
    };
  }

  return {
    allowed: true,
  };
}

export function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    return parseStoredUser(JSON.parse(storedValue));
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function storeUser(user: AuthUser) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

function parseStoredUser(value: unknown): AuthUser | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const user = value as Partial<AuthUser>;

  if (
    typeof user.id !== "string" ||
    typeof user.name !== "string" ||
    typeof user.email !== "string" ||
    (user.role !== "teacher" && user.role !== "student")
  ) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
