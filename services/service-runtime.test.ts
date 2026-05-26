import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createLocalUser } from "../features/auth/auth-session.ts";
import { AUTH_STORAGE_KEY } from "../features/auth/auth-session.ts";
import {
  DEFAULT_API_URL,
  getStoredAccessToken,
  isBackendMode,
} from "./service-runtime.ts";
import type { AuthStorage } from "./auth-service.ts";

describe("service runtime", () => {
  it("defaults to mock mode when no data source is configured", () => {
    assert.equal(isBackendMode(), false);
  });

  it("keeps the backend API URL default aligned with the API prefix", () => {
    assert.equal(DEFAULT_API_URL, "http://localhost:4000/api/v1");
  });

  it("reads an access token from the stored auth session", () => {
    const storage = createMemoryStorage();
    const user = createLocalUser({
      name: "Teacher",
      email: "teacher@example.com",
      role: "teacher",
    });

    storage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        user,
        accessToken: "test-token",
      }),
    );

    assert.equal(getStoredAccessToken(storage), "test-token");
  });

  it("returns null for legacy stored users without a token", () => {
    const storage = createMemoryStorage();
    const user = createLocalUser({
      name: "Student",
      email: "student@example.com",
      role: "student",
    });

    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

    assert.equal(getStoredAccessToken(storage), null);
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
