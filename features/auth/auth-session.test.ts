import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createLocalUser,
  getRoleHome,
  getRouteAccessDecision,
  type AuthUser,
} from "./auth-session.ts";

describe("auth-session", () => {
  it("maps each role to its dashboard", () => {
    assert.equal(getRoleHome("teacher"), "/teacher/dashboard");
    assert.equal(getRoleHome("student"), "/student/dashboard");
  });

  it("redirects anonymous users from protected routes to login", () => {
    assert.deepEqual(getRouteAccessDecision(null, "teacher"), {
      allowed: false,
      redirectTo: "/login",
    });
  });

  it("allows matching roles on protected routes", () => {
    const user: AuthUser = createLocalUser({
      name: "Teacher",
      email: "teacher@example.com",
      role: "teacher",
    });

    assert.deepEqual(getRouteAccessDecision(user, "teacher"), {
      allowed: true,
    });
  });

  it("redirects users with the wrong role to their own dashboard", () => {
    const user: AuthUser = createLocalUser({
      name: "Student",
      email: "student@example.com",
      role: "student",
    });

    assert.deepEqual(getRouteAccessDecision(user, "teacher"), {
      allowed: false,
      redirectTo: "/student/dashboard",
    });
  });
});
