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
    const detailsList = await classesService.listClassDetails();
    const details = await classesService.getClassDetails(classes[0].id);

    assert.ok(classes.length > 0);
    assert.equal(detailsList.length, classes.length);
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

  it("updates class overview fields", async () => {
    const updated = await classesService.updateClassOverview("1", {
      name: "Updated A2",
      description: "Updated description",
      level: "A2+",
    });

    assert.equal(updated.id, "1");
    assert.equal(updated.name, "Updated A2");
    assert.equal(updated.description, "Updated description");
    assert.equal(updated.level, "A2+");
  });

  it("deletes a class by id", async () => {
    const result = await classesService.deleteClass("1");

    assert.deepEqual(result, { id: "1" });
  });

  it("adds, updates, and removes students through class service", async () => {
    const added = await classesService.addStudent("1", {
      name: "New Student",
      email: "new.student@example.com",
    });
    const updated = await classesService.updateStudent("1", {
      id: added.id,
      name: "Updated Student",
      email: "updated.student@example.com",
    });
    const removed = await classesService.removeStudent("1", added.id);

    assert.equal(added.name, "New Student");
    assert.equal(added.email, "new.student@example.com");
    assert.equal(added.progress, 0);
    assert.equal(updated.id, added.id);
    assert.equal(updated.name, "Updated Student");
    assert.deepEqual(removed, { studentId: added.id });
  });

  it("assigns a word set to a class", async () => {
    const [wordSet] = await wordSetsService.listWordSetSummaries();
    const assigned = await classesService.assignWordSet("1", wordSet);

    assert.equal(assigned.classId, "1");
    assert.equal(assigned.title, wordSet.title);
    assert.equal(assigned.words, wordSet.words);
  });

  it("loads teacher and student word-set views", async () => {
    const teacherSets = await wordSetsService.listWordSetSummaries();
    const studentSets = await studentService.listAssignedWordSets();

    assert.ok(teacherSets.length > 0);
    assert.ok(studentSets.length > 0);
  });

  it("creates, updates, and deletes word sets", async () => {
    const created = await wordSetsService.createWordSet({
      title: "Phrasal verbs",
      description: "Common classroom phrasal verbs.",
    });
    const updated = await wordSetsService.updateWordSetOverview("w1", {
      title: "Updated routines",
      description: "Updated description",
      tag: "A2",
    });
    const deleted = await wordSetsService.deleteWordSet("w1");

    assert.equal(created.title, "Phrasal verbs");
    assert.equal(created.description, "Common classroom phrasal verbs.");
    assert.equal(created.words, 0);
    assert.equal(updated.title, "Updated routines");
    assert.equal(updated.className, "A2");
    assert.deepEqual(deleted, { id: "w1" });
  });

  it("assigns a word set to a class", async () => {
    const assigned = await wordSetsService.assignToClass("w1", {
      id: "2",
      name: "English B1",
      students: 8,
      wordSets: 3,
      progress: 74,
    });

    assert.equal(assigned.id, "2");
    assert.equal(assigned.name, "English B1");
  });

  it("adds, updates, and deletes words in a word set", async () => {
    const added = await wordSetsService.addWords("w1", [
      {
        term: "look up",
        translation: "search for information",
        exampleSentence: "Look up this word in a dictionary.",
      },
    ]);
    const updated = await wordSetsService.updateWord("w1", {
      id: added[0].id,
      term: "look after",
      translation: "take care of",
      exampleSentence: "She looks after her brother.",
    });
    const deleted = await wordSetsService.deleteWord("w1", added[0].id);
    const bulkDeleted = await wordSetsService.deleteWords("w1", ["word-1", "word-2"]);

    assert.equal(added.length, 1);
    assert.equal(added[0].masteryLevel, 0);
    assert.equal(updated.term, "look after");
    assert.deepEqual(deleted, { wordId: added[0].id });
    assert.deepEqual(bulkDeleted, { wordIds: ["word-1", "word-2"] });
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
