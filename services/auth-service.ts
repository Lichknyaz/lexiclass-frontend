import {
  AUTH_STORAGE_KEY,
  createLocalUser,
  parseStoredSession,
  type AuthUser,
  type UserRole,
} from "../features/auth/auth-session.ts";

export interface AuthStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface LoginInput {
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterInput extends LoginInput {
  name: string;
}

export interface AuthService {
  getCurrentUser(): Promise<AuthUser | null>;
  login(input: LoginInput): Promise<AuthUser>;
  register(input: RegisterInput): Promise<AuthUser>;
  logout(): Promise<void>;
}

export { AUTH_STORAGE_KEY };

export function createAuthService({
  storage = getBrowserStorage(),
}: {
  storage?: AuthStorage | null;
} = {}): AuthService {
  return {
    async getCurrentUser() {
      if (!storage) {
        return null;
      }

      const storedValue = storage.getItem(AUTH_STORAGE_KEY);

      if (!storedValue) {
        return null;
      }

      try {
        const session = parseStoredSession(JSON.parse(storedValue));
        const user = session?.user ?? null;

        if (!user) {
          storage.removeItem(AUTH_STORAGE_KEY);
        }

        return user;
      } catch {
        storage.removeItem(AUTH_STORAGE_KEY);
        return null;
      }
    },

    async login(input) {
      const user = createLocalUser({
        name: "",
        email: input.email,
        role: input.role,
      });

      saveUser(storage, user);
      return user;
    },

    async register(input) {
      const user = createLocalUser({
        name: input.name,
        email: input.email,
        role: input.role,
      });

      saveUser(storage, user);
      return user;
    },

    async logout() {
      storage?.removeItem(AUTH_STORAGE_KEY);
    },
  };
}

export const authService = createAuthService();

function saveUser(storage: AuthStorage | null, user: AuthUser) {
  storage?.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      user,
      accessToken: null,
    }),
  );
}

function getBrowserStorage(): AuthStorage | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}
