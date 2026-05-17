import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assignmentsService } from "./assignments-service.ts";
import { classesService } from "./classes-service.ts";
import { analyticsService } from "./analytics-service.ts";
import { practiceService } from "./practice-service.ts";
import { studentService } from "./student-service.ts";
import { wordSetsService } from "./word-sets-service.ts";

describe("domain service exports", () => {
  it("exposes each mock service through a domain entry file", async () => {
    const [classes, wordSets, joinedClasses, assignments, analytics] =
      await Promise.all([
        classesService.listClasses(),
        wordSetsService.listWordSetSummaries(),
        studentService.listJoinedClasses(),
        assignmentsService.listAssignments(),
        analyticsService.getTeacherAnalytics(),
      ]);

    assert.ok(classes.length > 0);
    assert.ok(wordSets.length > 0);
    assert.ok(joinedClasses.length > 0);
    assert.ok(assignments.length > 0);
    assert.ok(analytics.problemWords.length > 0);
    assert.equal(typeof practiceService.savePracticeSession, "function");
  });
});
