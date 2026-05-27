import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { MockClassDetails } from "../types/mock.ts";
import type { ApiClient } from "./api-client.ts";
import { createAssignmentsService } from "./assignments-service.ts";
import { createClassesService } from "./classes-service.ts";

describe("backend domain services", () => {
  it("maps teacher class CRUD to backend endpoints", async () => {
    const calls: Array<{ method: string; path: string; body?: unknown }> = [];
    const classDetails = createBackendClassDetails();
    const service = createClassesService({
      dataSource: "backend",
      client: createFakeApiClient({
        get: async (path) => {
          calls.push({ method: "GET", path });

          if (path === "/teacher/classes") {
            return [{ id: "class-1", name: "English A2", students: 1, wordSets: 0, progress: 0 }];
          }

          return classDetails;
        },
        post: async (path, body) => {
          calls.push({ method: "POST", path, body });
          return { id: "class-2", name: "English B1", students: 0, wordSets: 0, progress: 0 };
        },
        put: async (path, body) => {
          calls.push({ method: "PUT", path, body });
          return { ...classDetails, name: "Updated A2" };
        },
        delete: async (path) => {
          calls.push({ method: "DELETE", path });
          return { id: "class-1" };
        },
      }),
    });

    assert.equal((await service.listClasses())[0].id, "class-1");
    assert.equal((await service.getClassDetails("class-1"))?.id, "class-1");
    assert.equal((await service.createClass({ name: "English B1" })).id, "class-2");
    assert.equal(
      (
        await service.updateClassOverview("class-1", {
          name: "Updated A2",
          description: "Updated description",
          level: "A2",
        })
      ).name,
      "Updated A2",
    );
    assert.deepEqual(await service.deleteClass("class-1"), { id: "class-1" });
    assert.deepEqual(
      calls.map((call) => `${call.method} ${call.path}`),
      [
        "GET /teacher/classes",
        "GET /teacher/classes/class-1",
        "POST /teacher/classes",
        "PUT /teacher/classes/class-1",
        "DELETE /teacher/classes/class-1",
      ],
    );
  });

  it("normalizes nullable backend student practice dates", async () => {
    const service = createClassesService({
      dataSource: "backend",
      client: createFakeApiClient({
        get: async () => createBackendClassDetails(),
      }),
    });
    const details = await service.getClassDetails("class-1");

    assert.equal(details?.studentsList[0].lastPracticedAt, "Not practiced yet");
  });

  it("maps teacher student membership endpoints", async () => {
    const calls: Array<{ method: string; path: string; body?: unknown }> = [];
    const student = {
      id: "student-1",
      name: "Student Demo",
      email: "student@example.com",
      progress: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      lastPracticedAt: null,
    };
    const service = createClassesService({
      dataSource: "backend",
      client: createFakeApiClient({
        post: async (path, body) => {
          calls.push({ method: "POST", path, body });
          return student;
        },
        put: async (path, body) => {
          calls.push({ method: "PUT", path, body });
          return { ...student, name: "Updated Student" };
        },
        delete: async (path) => {
          calls.push({ method: "DELETE", path });
          return { studentId: "student-1" };
        },
      }),
    });

    assert.equal(
      (
        await service.addStudent("class-1", {
          name: "Student Demo",
          email: "student@example.com",
        })
      ).lastPracticedAt,
      "Not practiced yet",
    );
    assert.equal(
      (
        await service.updateStudent("class-1", {
          id: "student-1",
          name: "Updated Student",
          email: "student@example.com",
        })
      ).name,
      "Updated Student",
    );
    assert.deepEqual(await service.removeStudent("class-1", "student-1"), {
      studentId: "student-1",
    });
    assert.deepEqual(
      calls.map((call) => `${call.method} ${call.path}`),
      [
        "POST /teacher/classes/class-1/students",
        "PUT /teacher/classes/class-1/students/student-1",
        "DELETE /teacher/classes/class-1/students/student-1",
      ],
    );
  });

  it("maps assignment service endpoints", async () => {
    const calls: Array<{ method: string; path: string; body?: unknown }> = [];
    const assignment = {
      id: "assignment-1",
      classId: "class-1",
      wordSetId: "word-set-1",
      assignedAt: "2026-05-27T10:00:00.000Z",
    };
    const service = createAssignmentsService({
      dataSource: "backend",
      client: createFakeApiClient({
        get: async (path) => {
          calls.push({ method: "GET", path });
          return [assignment];
        },
        post: async (path, body) => {
          calls.push({ method: "POST", path, body });
          return assignment;
        },
      }),
    });

    assert.deepEqual(await service.listAssignments(), [assignment]);
    assert.deepEqual(
      await service.createAssignment({
        classId: "class-1",
        wordSetId: "word-set-1",
      }),
      assignment,
    );
    assert.deepEqual(
      calls.map((call) => `${call.method} ${call.path}`),
      ["GET /teacher/assignments", "POST /teacher/assignments"],
    );
  });

  it("assigns a word set to a class and returns a UI-compatible assigned set", async () => {
    const service = createClassesService({
      dataSource: "backend",
      client: createFakeApiClient({
        post: async () => ({
          id: "assignment-1",
          classId: "class-1",
          wordSetId: "word-set-1",
        }),
        get: async () => createBackendClassDetails(),
      }),
    });
    const assigned = await service.assignWordSet("class-1", {
      id: "word-set-1",
      title: "Travel vocabulary",
      description: "Words for trips.",
      words: 12,
      assignedClasses: 0,
    });

    assert.deepEqual(assigned, {
      id: "assignment-1",
      classId: "class-1",
      title: "Travel vocabulary",
      description: "Words for trips.",
      words: 12,
      assignedStudents: 1,
      averageProgress: 0,
    });
  });
});

type BackendClassDetailsFixture = Omit<MockClassDetails, "studentsList"> & {
  studentsList: Array<
    Omit<MockClassDetails["studentsList"][number], "lastPracticedAt"> & {
      lastPracticedAt: string | null;
    }
  >;
};

function createBackendClassDetails(): BackendClassDetailsFixture {
  return {
    id: "class-1",
    name: "English A2",
    students: 1,
    wordSets: 0,
    progress: 0,
    inviteCode: "A2-7KQ9",
    level: "A2",
    description: "General English group.",
    studentsList: [
      {
        id: "student-1",
        name: "Student Demo",
        email: "student@example.com",
        progress: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        lastPracticedAt: null,
      },
    ],
    wordSetsList: [],
    problemWords: [],
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
