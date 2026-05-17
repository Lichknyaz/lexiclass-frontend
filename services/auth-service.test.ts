import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createAuthService, type AuthStorage } from "./auth-service.ts";

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
});

function createMemoryStorage(): AuthStorage {
  const values = new Map<string, string>();

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}
