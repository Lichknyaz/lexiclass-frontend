import {
  AUTH_STORAGE_KEY,
  createLocalUser,
  parseStoredSession,
  type AuthSession,
  type AuthUser,
  type UserRole,
} from "../features/auth/auth-session.ts";
import type { ApiClient } from "./api-client.ts";
import {
  createRuntimeApiClient,
  getStoredAccessToken,
  isBackendMode,
  type DataSource,
} from "./service-runtime.ts";

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
  apiClient = createRuntimeApiClient({ storage }),
  dataSource,
}: {
  storage?: AuthStorage | null;
  apiClient?: ApiClient;
  dataSource?: DataSource;
} = {}): AuthService {
  const usesBackend = () => dataSource === "backend" || (!dataSource && isBackendMode());

  return {
    async getCurrentUser() {
      if (!storage) {
        return null;
      }

      if (usesBackend()) {
        const token = getStoredAccessToken(storage);

        if (!token) {
          return null;
        }

        try {
          const user = await apiClient.get<AuthUser>("/auth/me");
          saveSession(storage, {
            user,
            accessToken: token,
          });
          return user;
        } catch {
          storage.removeItem(AUTH_STORAGE_KEY);
          return null;
        }
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
      if (usesBackend()) {
        const session = await apiClient.post<AuthSession, LoginInput>(
          "/auth/login",
          input,
        );

        saveSession(storage, session);
        return session.user;
      }

      const user = createLocalUser({
        name: "",
        email: input.email,
        role: input.role,
      });

      saveUser(storage, user);
      return user;
    },

    async register(input) {
      if (usesBackend()) {
        const session = await apiClient.post<AuthSession, RegisterInput>(
          "/auth/register",
          input,
        );

        saveSession(storage, session);
        return session.user;
      }

      const user = createLocalUser({
        name: input.name,
        email: input.email,
        role: input.role,
      });

      saveUser(storage, user);
      return user;
    },

    async logout() {
      if (usesBackend() && getStoredAccessToken(storage)) {
        try {
          await apiClient.post<null, Record<string, never>>("/auth/logout", {});
        } catch {
        }
      }

      storage?.removeItem(AUTH_STORAGE_KEY);
    },
  };
}

export const authService = createAuthService();

function saveUser(storage: AuthStorage | null, user: AuthUser) {
  saveSession(storage, {
    user,
    accessToken: null,
  });
}

function saveSession(storage: AuthStorage | null, session: AuthSession) {
  storage?.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify(session),
  );
}

function getBrowserStorage(): AuthStorage | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}
