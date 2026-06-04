import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { MockClassDetails } from "../types/mock.ts";
import type { ApiClient } from "./api-client.ts";
import { createAssignmentsService } from "./assignments-service.ts";
import { createAnalyticsService } from "./analytics-service.ts";
import { createClassesService } from "./classes-service.ts";
import { createPracticeService } from "./practice-service.ts";
import { createStudentService } from "./student-service.ts";
import { createWordSetsService } from "./word-sets-service.ts";

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

  it("formats teacher class student practice timestamps for display", async () => {
    const service = createClassesService({
      dataSource: "backend",
      client: createFakeApiClient({
        get: async () => ({
          ...createBackendClassDetails(),
          studentsList: [
            {
              ...createBackendClassDetails().studentsList[0],
              lastPracticedAt: "2026-05-29T14:52:18.454Z",
            },
          ],
        }),
      }),
    });
    const details = await service.getClassDetails("class-1");

    assert.notEqual(
      details?.studentsList[0].lastPracticedAt,
      "2026-05-29T14:52:18.454Z",
    );
    assert.match(details?.studentsList[0].lastPracticedAt ?? "", /2026/);
    assert.match(
      details?.studentsList[0].lastPracticedAt ?? "",
      /14:52|2:52|16:52|4:52/,
    );
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

  it("maps teacher word-set CRUD to backend endpoints", async () => {
    const calls: Array<{ method: string; path: string; body?: unknown }> = [];
    const details = createWordSetDetails();
    const service = createWordSetsService({
      dataSource: "backend",
      client: createFakeApiClient({
        get: async (path) => {
          calls.push({ method: "GET", path });

          if (path === "/teacher/word-sets") {
            return [
              {
                id: "word-set-1",
                title: "Travel vocabulary",
                description: "Words for trips.",
                words: 2,
                assignedClasses: 1,
              },
            ];
          }

          return details;
        },
        post: async (path, body) => {
          calls.push({ method: "POST", path, body });
          return {
            id: "word-set-2",
            title: "Food vocabulary",
            description: "Words for restaurants.",
            words: 0,
            assignedClasses: 0,
          };
        },
        put: async (path, body) => {
          calls.push({ method: "PUT", path, body });
          return { ...details, title: "Updated travel" };
        },
        delete: async (path) => {
          calls.push({ method: "DELETE", path });
          return { id: "word-set-1" };
        },
      }),
    });

    assert.equal((await service.listWordSetSummaries())[0].id, "word-set-1");
    assert.equal((await service.getWordSetDetails("word-set-1"))?.id, "word-set-1");
    assert.equal(
      (
        await service.createWordSet({
          title: "Food vocabulary",
          description: "Words for restaurants.",
        })
      ).id,
      "word-set-2",
    );
    assert.equal(
      (
        await service.updateWordSetOverview("word-set-1", {
          title: "Updated travel",
          description: "Updated description",
          tag: "A2",
        })
      ).title,
      "Updated travel",
    );
    assert.deepEqual(await service.deleteWordSet("word-set-1"), {
      id: "word-set-1",
    });
    assert.deepEqual(
      calls.map((call) => `${call.method} ${call.path}`),
      [
        "GET /teacher/word-sets",
        "GET /teacher/word-sets/word-set-1",
        "POST /teacher/word-sets",
        "PUT /teacher/word-sets/word-set-1",
        "DELETE /teacher/word-sets/word-set-1",
      ],
    );
  });

  it("maps teacher word mutations and bulk delete to nested endpoints", async () => {
    const calls: Array<{ method: string; path: string; body?: unknown }> = [];
    const word = createWordSetDetails().wordsList[0];
    const service = createWordSetsService({
      dataSource: "backend",
      client: createFakeApiClient({
        post: async (path, body) => {
          calls.push({ method: "POST", path, body });

          if (path.endsWith("/bulk-delete")) {
            return { wordIds: ["word-1", "word-2"] };
          }

          return [word];
        },
        put: async (path, body) => {
          calls.push({ method: "PUT", path, body });
          return { ...word, term: "updated journey" };
        },
        delete: async (path) => {
          calls.push({ method: "DELETE", path });
          return { wordId: "word-1" };
        },
      }),
    });

    assert.equal(
      (
        await service.addWords("word-set-1", [
          {
            term: "journey",
            translation: "подорож",
            exampleSentence: "The journey took three hours.",
          },
        ])
      )[0].id,
      "word-1",
    );
    assert.equal(
      (
        await service.updateWord("word-set-1", {
          id: "word-1",
          term: "updated journey",
          translation: "подорож",
          exampleSentence: "The journey took three hours.",
        })
      ).term,
      "updated journey",
    );
    assert.deepEqual(await service.deleteWord("word-set-1", "word-1"), {
      wordId: "word-1",
    });
    assert.deepEqual(
      await service.deleteWords("word-set-1", ["word-1", "word-2"]),
      { wordIds: ["word-1", "word-2"] },
    );
    assert.deepEqual(
      calls.map((call) => `${call.method} ${call.path}`),
      [
        "POST /teacher/word-sets/word-set-1/words",
        "PUT /teacher/word-sets/word-set-1/words/word-1",
        "DELETE /teacher/word-sets/word-set-1/words/word-1",
        "POST /teacher/word-sets/word-set-1/words/bulk-delete",
      ],
    );
  });

  it("assigns a teacher word set to a class through assignment endpoint", async () => {
    const calls: Array<{ method: string; path: string; body?: unknown }> = [];
    const classItem = {
      id: "class-1",
      name: "English A2",
      students: 1,
      wordSets: 1,
      progress: 0,
    };
    const service = createWordSetsService({
      dataSource: "backend",
      client: createFakeApiClient({
        post: async (path, body) => {
          calls.push({ method: "POST", path, body });
          return {
            id: "assignment-1",
            classId: "class-1",
            wordSetId: "word-set-1",
          };
        },
      }),
    });

    assert.deepEqual(await service.assignToClass("word-set-1", classItem), classItem);
    assert.deepEqual(calls, [
      {
        method: "POST",
        path: "/teacher/assignments",
        body: {
          classId: "class-1",
          wordSetId: "word-set-1",
        },
      },
    ]);
  });

  it("maps student classes, assignments, and join endpoints", async () => {
    const calls: Array<{ method: string; path: string; body?: unknown }> = [];
    const joinedClass = {
      id: "class-1",
      name: "English A2",
      teacherName: "Teacher Demo",
      level: "A2",
      progress: 0,
      wordSets: [],
    };
    const assignedWordSet = {
      id: "assignment-1",
      classId: "class-1",
      className: "English A2",
      title: "Travel vocabulary",
      words: 2,
      completedWords: 0,
      progress: 0,
      dueLabel: "No due date",
    };
    const service = createStudentService({
      dataSource: "backend",
      client: createFakeApiClient({
        get: async (path) => {
          calls.push({ method: "GET", path });

          return path === "/student/classes" ? [joinedClass] : [assignedWordSet];
        },
        post: async (path, body) => {
          calls.push({ method: "POST", path, body });
          return joinedClass;
        },
      }),
    });

    assert.deepEqual(await service.listJoinedClasses(), [joinedClass]);
    assert.deepEqual(await service.listAssignedWordSets(), [assignedWordSet]);
    assert.deepEqual(await service.getAssignedWordSet("assignment-1"), assignedWordSet);
    assert.deepEqual(await service.joinClass("A2-7KQ9"), joinedClass);
    assert.deepEqual(
      calls.map((call) => `${call.method} ${call.path}`),
      [
        "GET /student/classes",
        "GET /student/assignments",
        "GET /student/assignments",
        "POST /student/classes/join",
      ],
    );
  });

  it("gets student word-set details by assignment id", async () => {
    const service = createStudentService({
      dataSource: "backend",
      client: createFakeApiClient({
        get: async (path) => {
          assert.equal(path, "/student/word-sets/assignment-1");
          return createWordSetDetails();
        },
      }),
    });
    const details = await service.getAssignedWordSetDetails("assignment-1");

    assert.equal(details?.id, "word-set-1");
  });

  it("maps student progress words to the progress endpoint", async () => {
    const service = createStudentService({
      dataSource: "backend",
      client: createFakeApiClient({
        get: async (path) => {
          assert.equal(path, "/student/progress/words");
          return [
            {
              id: "word-1",
              term: "journey",
              translation: "подорож",
              masteryLevel: 50,
              correctCount: 1,
              wrongCount: 1,
              lastPracticedAt: null,
            },
          ];
        },
      }),
    });
    const words = await service.listProgressWords();

    assert.equal(words[0].lastPracticedAt, "Not practiced yet");
  });

  it("formats student progress timestamps for display", async () => {
    const service = createStudentService({
      dataSource: "backend",
      client: createFakeApiClient({
        get: async (path) => {
          assert.equal(path, "/student/progress/words");
          return [
            {
              id: "word-1",
              term: "journey",
              translation: "подорож",
              masteryLevel: 50,
              correctCount: 1,
              wrongCount: 1,
              lastPracticedAt: "2026-05-29T14:49:48.886Z",
            },
          ];
        },
      }),
    });
    const words = await service.listProgressWords();

    assert.notEqual(words[0].lastPracticedAt, "2026-05-29T14:49:48.886Z");
    assert.match(words[0].lastPracticedAt, /2026/);
    assert.match(words[0].lastPracticedAt, /14:49|2:49|16:49|4:49/);
  });

  it("persists practice sessions with backend practice mode values", async () => {
    const service = createPracticeService({
      dataSource: "backend",
      client: createFakeApiClient({
        post: async (path, body) => {
          assert.equal(path, "/student/practice-sessions");
          assert.deepEqual(body, {
            assignmentId: "assignment-1",
            mode: "multiple_choice",
            attempts: [
              {
                wordId: "word-1",
                status: "correct",
                answeredAt: "2026-05-27T10:00:00.000Z",
              },
            ],
          });

          return {
            assignmentId: "assignment-1",
            studentId: "student-1",
            mode: "multiple_choice",
            correctAnswers: 1,
            wrongAnswers: 0,
            wordResults: [
              {
                wordId: "word-1",
                correctAnswers: 1,
                wrongAnswers: 0,
              },
            ],
          };
        },
      }),
    });
    const result = await service.savePracticeSession({
      assignmentId: "assignment-1",
      studentId: "student-1",
      mode: "multiple-choice",
      attempts: [
        {
          wordId: "word-1",
          status: "correct",
          answeredAt: "2026-05-27T10:00:00.000Z",
        },
      ],
    });

    assert.equal(result.mode, "multiple-choice");
    assert.equal(result.correctAnswers, 1);
  });

  it("maps teacher analytics endpoint with optional class filter", async () => {
    const calls: string[] = [];
    const analytics = {
      totalStudents: 1,
      totalWordSets: 1,
      averageProgress: 50,
      classProgress: [createBackendClassDetails()],
      problemWords: [],
    };
    const service = createAnalyticsService({
      dataSource: "backend",
      client: createFakeApiClient({
        get: async (path) => {
          calls.push(path);
          return analytics;
        },
      }),
    });

    assert.deepEqual(await service.getTeacherAnalytics(), analytics);
    assert.deepEqual(
      await service.getTeacherAnalytics("class 1"),
      analytics,
    );
    assert.deepEqual(calls, [
      "/teacher/analytics",
      "/teacher/analytics?classId=class%201",
    ]);
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

function createWordSetDetails() {
  return {
    id: "word-set-1",
    classId: "class-1",
    className: "English A2",
    title: "Travel vocabulary",
    description: "Words for trips.",
    words: 2,
    assignedStudents: 1,
    averageProgress: 0,
    createdAt: "2026-05-27T10:00:00.000Z",
    wordsList: [
      {
        id: "word-1",
        term: "journey",
        translation: "подорож",
        exampleSentence: "The journey took three hours.",
        transcription: null,
        masteryLevel: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
      },
    ],
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
