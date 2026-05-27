import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AUTH_STORAGE_KEY,
  createAuthService,
  type AuthStorage,
} from "./auth-service.ts";
import type { ApiClient } from "./api-client.ts";

describe("auth service", () => {
  it("registers a local user and stores the session", async () => {
    const storage = createMemoryStorage();
    const service = createAuthService({ storage });
    const user = await service.register({
      name: "Test Teacher",
      email: "TEACHER@example.com",
      password: "123456",
      role: "teacher",
    });

    assert.equal(user.name, "Test Teacher");
    assert.equal(user.email, "teacher@example.com");
    assert.equal(user.role, "teacher");
    assert.deepEqual(await service.getCurrentUser(), user);
  });

  it("logs in with a role and derives a fallback name from email", async () => {
    const storage = createMemoryStorage();
    const service = createAuthService({ storage });
    const user = await service.login({
      email: "student@example.com",
      password: "123456",
      role: "student",
    });

    assert.equal(user.name, "student");
    assert.equal(user.role, "student");
    assert.deepEqual(await service.getCurrentUser(), user);
  });

  it("logs out by clearing the stored user", async () => {
    const storage = createMemoryStorage();
    const service = createAuthService({ storage });

    await service.login({
      email: "teacher@example.com",
      password: "123456",
      role: "teacher",
    });
    await service.logout();

    assert.equal(await service.getCurrentUser(), null);
  });

  it("clears invalid stored session data", async () => {
    const storage = createMemoryStorage();
    const service = createAuthService({ storage });

    storage.setItem("lexiclass-auth-user", JSON.stringify({ role: "admin" }));

    assert.equal(await service.getCurrentUser(), null);
    assert.equal(storage.getItem("lexiclass-auth-user"), null);
  });

  it("logs in through the backend and stores the access token", async () => {
    const storage = createMemoryStorage();
    const apiClient = createFakeApiClient({
      post: async (path, body) => {
        assert.equal(path, "/auth/login");
        assert.deepEqual(body, {
          email: "teacher@example.com",
          password: "password",
          role: "teacher",
        });

        return {
          user: {
            id: "teacher-1",
            name: "Teacher Demo",
            email: "teacher@example.com",
            role: "teacher",
          },
          accessToken: "backend-token",
        };
      },
    });
    const service = createAuthService({
      storage,
      apiClient,
      dataSource: "backend",
    });
    const user = await service.login({
      email: "teacher@example.com",
      password: "password",
      role: "teacher",
    });

    assert.equal(user.id, "teacher-1");
    assert.deepEqual(JSON.parse(storage.getItem(AUTH_STORAGE_KEY) ?? ""), {
      user,
      accessToken: "backend-token",
    });
  });

  it("registers through the backend and stores the returned session", async () => {
    const storage = createMemoryStorage();
    const apiClient = createFakeApiClient({
      post: async (path, body) => {
        assert.equal(path, "/auth/register");
        assert.deepEqual(body, {
          name: "New Student",
          email: "student@example.com",
          password: "password",
          role: "student",
        });

        return {
          user: {
            id: "student-2",
            name: "New Student",
            email: "student@example.com",
            role: "student",
          },
          accessToken: "student-token",
        };
      },
    });
    const service = createAuthService({
      storage,
      apiClient,
      dataSource: "backend",
    });
    const user = await service.register({
      name: "New Student",
      email: "student@example.com",
      password: "password",
      role: "student",
    });

    assert.equal(user.id, "student-2");
    assert.deepEqual(JSON.parse(storage.getItem(AUTH_STORAGE_KEY) ?? ""), {
      user,
      accessToken: "student-token",
    });
  });

  it("loads the current backend user through auth me when a token exists", async () => {
    const storage = createMemoryStorage();
    const user = {
      id: "student-1",
      name: "Student Demo",
      email: "student@example.com",
      role: "student" as const,
    };

    storage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        user,
        accessToken: "backend-token",
      }),
    );

    const apiClient = createFakeApiClient({
      get: async (path) => {
        assert.equal(path, "/auth/me");
        return user;
      },
    });
    const service = createAuthService({
      storage,
      apiClient,
      dataSource: "backend",
    });

    assert.deepEqual(await service.getCurrentUser(), user);
  });

  it("clears backend session on logout even when backend logout fails", async () => {
    const storage = createMemoryStorage();
    const user = {
      id: "student-1",
      name: "Student Demo",
      email: "student@example.com",
      role: "student" as const,
    };

    storage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        user,
        accessToken: "backend-token",
      }),
    );

    const service = createAuthService({
      storage,
      dataSource: "backend",
      apiClient: createFakeApiClient({
        post: async (path) => {
          assert.equal(path, "/auth/logout");
          throw new Error("Network failed");
        },
      }),
    });

    await service.logout();

    assert.equal(storage.getItem(AUTH_STORAGE_KEY), null);
  });
});

function createMemoryStorage(): AuthStorage {
  const values = new Map<string, string>();

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

interface FakeApiClientHandlers {
  get?: (path: string) => Promise<unknown>;
  post?: (path: string, body: unknown) => Promise<unknown>;
  put?: (path: string, body: unknown) => Promise<unknown>;
  delete?: (path: string) => Promise<unknown>;
}

function createFakeApiClient(handlers: FakeApiClientHandlers): ApiClient {
  return {
    get: async <TResponse>(path: string) => {
      if (!handlers.get) {
        throw new Error("Unexpected GET request");
      }

      return (await handlers.get(path)) as TResponse;
    },
    post: async <TResponse, TBody = unknown>(path: string, body: TBody) => {
      if (!handlers.post) {
        throw new Error("Unexpected POST request");
      }

      return (await handlers.post(path, body)) as TResponse;
    },
    put: async <TResponse, TBody = unknown>(path: string, body: TBody) => {
      if (!handlers.put) {
        throw new Error("Unexpected PUT request");
      }

      return (await handlers.put(path, body)) as TResponse;
    },
    delete: async <TResponse>(path: string) => {
      if (!handlers.delete) {
        throw new Error("Unexpected DELETE request");
      }

      return (await handlers.delete(path)) as TResponse;
    },
  };
}
