import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  analyticsService,
  classesService,
  practiceService,
  studentService,
  wordSetsService,
} from "./mock-services.ts";

describe("mock domain services", () => {
  it("loads teacher class summaries and class details", async () => {
    const classes = await classesService.listClasses();
    const details = await classesService.getClassDetails(classes[0].id);

    assert.ok(classes.length > 0);
    assert.equal(details?.id, classes[0].id);
    assert.ok(details?.inviteCode);
  });

  it("creates class summaries without mutating mock source arrays", async () => {
    const before = await classesService.listClasses();
    const created = await classesService.createClass({ name: "New B2" });
    const after = await classesService.listClasses();

    assert.equal(created.name, "New B2");
    assert.equal(created.students, 0);
    assert.equal(after.length, before.length);
  });

  it("loads teacher and student word-set views", async () => {
    const teacherSets = await wordSetsService.listWordSetSummaries();
    const studentSets = await studentService.listAssignedWordSets();

    assert.ok(teacherSets.length > 0);
    assert.ok(studentSets.length > 0);
  });

  it("accepts the known mock invite code", async () => {
    const joined = await studentService.joinClass("a2-7kq9");

    assert.equal(joined.name, "English A2");
  });

  it("rejects unknown invite codes", async () => {
    await assert.rejects(() => studentService.joinClass("missing"), /Invalid invite code/);
  });

  it("returns a practice result with per-word attempts", async () => {
    const result = await practiceService.savePracticeSession({
      assignmentId: "1-w1",
      studentId: "student-1",
      mode: "writing",
      attempts: [
        { wordId: "word-1", correct: true },
        { wordId: "word-2", correct: false },
      ],
    });

    assert.equal(result.correctAnswers, 1);
    assert.equal(result.wrongAnswers, 1);
    assert.equal(result.wordResults.length, 2);
  });

  it("aggregates teacher analytics from mock data", async () => {
    const analytics = await analyticsService.getTeacherAnalytics();

    assert.ok(analytics.totalStudents > 0);
    assert.ok(analytics.averageProgress >= 0);
    assert.ok(analytics.problemWords.length > 0);
  });
});
