import {
  getMockClassDetails,
  getMockWordSetDetails,
  mockClassDetails,
  mockClasses,
  mockStudentClasses,
  mockStudentProgressWords,
  mockWordSetDetails,
  mockWordSetSummaries,
} from "../mock/mock-data.ts";
import type {
  MockClassDetails,
  MockClassSummary,
  MockProblemWord,
  MockStudent,
  MockStudentClass,
  MockStudentProgressWord,
  MockStudentWordSet,
  MockWord,
  MockWordSet,
  MockWordSetDetails,
  MockWordSetSummary,
} from "../types/mock.ts";
import { getAverage, getMistakeRate } from "../utils/progress.ts";

export interface CreateClassInput {
  name: string;
}

export interface ClassOverviewInput {
  name: string;
  description: string;
  level: string;
}

export interface StudentInput {
  name: string;
  email: string;
}

export interface StudentProfileInput extends StudentInput {
  id: string;
}

export interface CreateWordSetInput {
  title: string;
  description: string;
}

export interface WordSetOverviewInput {
  title: string;
  description: string;
  tag: string;
}

export interface WordInput {
  term: string;
  translation: string;
  exampleSentence: string;
}

export interface WordProfileInput extends WordInput {
  id: string;
}

export interface PracticeAttemptInput {
  wordId: string;
  status?: "correct" | "wrong";
  correct?: boolean;
  answeredAt?: string;
}

export interface SavePracticeSessionInput {
  assignmentId: string;
  studentId: string;
  mode: "flashcard" | "multiple-choice" | "writing";
  attempts: PracticeAttemptInput[];
}

export interface PracticeWordResult {
  wordId: string;
  correctAnswers: number;
  wrongAnswers: number;
}

export interface StoredPracticeAttempt {
  id: string;
  assignmentId: string;
  studentId: string;
  wordId: string;
  status: "correct" | "wrong";
  mode: SavePracticeSessionInput["mode"];
  answeredAt: string;
}

export interface PracticeSessionResult {
  assignmentId: string;
  studentId: string;
  mode: SavePracticeSessionInput["mode"];
  correctAnswers: number;
  wrongAnswers: number;
  wordResults: PracticeWordResult[];
}

export interface TeacherAnalytics {
  totalStudents: number;
  totalWordSets: number;
  averageProgress: number;
  classProgress: MockClassDetails[];
  problemWords: MockProblemWord[];
}

export interface AssignmentInput {
  classId: string;
  wordSetId: string;
}

export interface MockAssignment {
  id: string;
  classId: string;
  wordSetId: string;
  assignedAt: string;
}

let practiceAttemptSequence = 0;
const practiceAttempts: StoredPracticeAttempt[] = [];
let assignments = createInitialAssignments();

export const assignmentsService = {
  async listAssignments(): Promise<MockAssignment[]> {
    return clone(assignments);
  },

  async createAssignment(input: AssignmentInput): Promise<MockAssignment> {
    return clone(createAssignmentRecord(input));
  },

  resetAssignments(nextAssignments = createInitialAssignments()) {
    assignments = clone(nextAssignments);
  },
};

export const classesService = {
  async listClasses(): Promise<MockClassSummary[]> {
    return clone(mockClasses);
  },

  async listClassDetails(): Promise<MockClassDetails[]> {
    return clone(mockClassDetails);
  },

  async getClassDetails(id: string): Promise<MockClassDetails | undefined> {
    return clone(getMockClassDetails(id));
  },

  async createClass(input: CreateClassInput): Promise<MockClassSummary> {
    return {
      id: `local-${Date.now()}`,
      name: input.name.trim(),
      students: 0,
      wordSets: 0,
      progress: 0,
    };
  },

  async updateClassOverview(
    id: string,
    input: ClassOverviewInput,
  ): Promise<MockClassDetails> {
    const classDetails = getRequiredClassDetails(id);

    return {
      ...classDetails,
      name: input.name.trim(),
      description: input.description.trim(),
      level: input.level.trim(),
    };
  },

  async deleteClass(id: string): Promise<{ id: string }> {
    getRequiredClassDetails(id);

    return { id };
  },

  async addStudent(
    classId: string,
    input: StudentInput,
  ): Promise<MockStudent> {
    getRequiredClassDetails(classId);

    const email = input.email.trim();
    const fallbackName = email.split("@")[0] || "New student";

    return {
      id: `local-student-${Date.now()}`,
      name: input.name.trim() || fallbackName,
      email,
      progress: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      lastPracticedAt: "Not practiced yet",
    };
  },

  async updateStudent(
    classId: string,
    input: StudentProfileInput,
  ): Promise<MockStudent> {
    const classDetails = getRequiredClassDetails(classId);
    const existingStudent = classDetails.studentsList.find(
      (student) => student.id === input.id,
    );

    return {
      ...(existingStudent ?? {
        progress: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        lastPracticedAt: "Not practiced yet",
      }),
      id: input.id,
      name: input.name.trim(),
      email: input.email.trim(),
    };
  },

  async removeStudent(
    classId: string,
    studentId: string,
  ): Promise<{ studentId: string }> {
    getRequiredClassDetails(classId);

    return { studentId };
  },

  async assignWordSet(
    classId: string,
    wordSet: MockWordSetSummary,
  ): Promise<MockWordSet> {
    const classDetails = getRequiredClassDetails(classId);
    const assignment = createAssignmentRecord({
      classId,
      wordSetId: wordSet.id,
    });

    return {
      id: assignment.id,
      classId,
      title: wordSet.title,
      description: wordSet.description,
      words: wordSet.words,
      assignedStudents: classDetails.students,
      averageProgress: 0,
    };
  },
};

export const wordSetsService = {
  async listWordSetSummaries(): Promise<MockWordSetSummary[]> {
    return clone(mockWordSetSummaries);
  },

  async getWordSetDetails(
    id: string,
  ): Promise<MockWordSetDetails | undefined> {
    return clone(getMockWordSetDetails(id));
  },

  async createWordSet(
    input: CreateWordSetInput,
  ): Promise<MockWordSetSummary> {
    return {
      id: `local-word-set-${Date.now()}`,
      title: input.title.trim(),
      description: input.description.trim(),
      words: 0,
      assignedClasses: 0,
    };
  },

  async updateWordSetOverview(
    id: string,
    input: WordSetOverviewInput,
  ): Promise<MockWordSetDetails> {
    const wordSet = getRequiredWordSetDetails(id);

    return {
      ...wordSet,
      title: input.title.trim(),
      description: input.description.trim(),
      className: input.tag.trim(),
    };
  },

  async deleteWordSet(id: string): Promise<{ id: string }> {
    getRequiredWordSetDetails(id);

    return { id };
  },

  async assignToClass(
    wordSetId: string,
    classItem: MockClassSummary,
  ): Promise<MockClassSummary> {
    getRequiredWordSetDetails(wordSetId);
    createAssignmentRecord({ classId: classItem.id, wordSetId });

    return clone(classItem);
  },

  async addWords(
    wordSetId: string,
    input: WordInput[],
  ): Promise<MockWord[]> {
    getRequiredWordSetDetails(wordSetId);

    return input.map((word, index) => ({
      id: `local-word-${Date.now()}-${index}`,
      term: word.term.trim(),
      translation: word.translation.trim(),
      exampleSentence: word.exampleSentence.trim(),
      masteryLevel: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
    }));
  },

  async updateWord(
    wordSetId: string,
    input: WordProfileInput,
  ): Promise<MockWord> {
    const wordSet = getRequiredWordSetDetails(wordSetId);
    const existingWord = wordSet.wordsList.find((word) => word.id === input.id);

    return {
      ...(existingWord ?? {
        masteryLevel: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
      }),
      id: input.id,
      term: input.term.trim(),
      translation: input.translation.trim(),
      exampleSentence: input.exampleSentence.trim(),
    };
  },

  async deleteWord(
    wordSetId: string,
    wordId: string,
  ): Promise<{ wordId: string }> {
    getRequiredWordSetDetails(wordSetId);

    return { wordId };
  },

  async deleteWords(
    wordSetId: string,
    wordIds: string[],
  ): Promise<{ wordIds: string[] }> {
    getRequiredWordSetDetails(wordSetId);

    return { wordIds };
  },
};

export const studentService = {
  async listJoinedClasses(): Promise<MockStudentClass[]> {
    return clone(mockStudentClasses);
  },

  async listAssignedWordSets(): Promise<MockStudentWordSet[]> {
    const joinedClassIds = new Set(mockStudentClasses.map((classItem) => classItem.id));

    return clone(
      assignments
        .filter((assignment) => joinedClassIds.has(assignment.classId))
        .map(toStudentWordSet)
        .filter((wordSet): wordSet is MockStudentWordSet => Boolean(wordSet)),
    );
  },

  async getAssignedWordSet(
    id: string,
  ): Promise<MockStudentWordSet | undefined> {
    const assignedWordSets = await this.listAssignedWordSets();

    return clone(assignedWordSets.find((wordSet) => wordSet.id === id));
  },

  async listProgressWords(): Promise<MockStudentProgressWord[]> {
    return clone(mockStudentProgressWords);
  },

  async joinClass(inviteCode: string): Promise<MockStudentClass> {
    const normalizedCode = inviteCode.trim().toUpperCase();
    const classDetails = mockClassDetails.find(
      (classItem) => classItem.inviteCode === normalizedCode,
    );

    if (!classDetails) {
      throw new Error("Invalid invite code");
    }

    return {
      id: classDetails.id,
      name: classDetails.name,
      teacherName: "Teacher",
      level: classDetails.level,
      progress: classDetails.progress,
      wordSets: classDetails.wordSetsList.map((wordSet) => ({
        id: wordSet.id,
        classId: classDetails.id,
        className: classDetails.name,
        title: wordSet.title,
        words: wordSet.words,
        completedWords: 0,
        progress: 0,
        dueLabel: "Practice today",
      })),
    };
  },
};

export const practiceService = {
  async savePracticeSession(
    input: SavePracticeSessionInput,
  ): Promise<PracticeSessionResult> {
    const storedAttempts = input.attempts.map((attempt) => {
      const status = normalizeAttemptStatus(attempt);

      return {
        id: `practice-attempt-${++practiceAttemptSequence}`,
        assignmentId: input.assignmentId,
        studentId: input.studentId,
        wordId: attempt.wordId,
        status,
        mode: input.mode,
        answeredAt: attempt.answeredAt ?? new Date().toISOString(),
      };
    });
    const wordResults = storedAttempts.map((attempt) => ({
      wordId: attempt.wordId,
      correctAnswers: attempt.status === "correct" ? 1 : 0,
      wrongAnswers: attempt.status === "wrong" ? 1 : 0,
    }));

    practiceAttempts.push(...storedAttempts);

    return {
      assignmentId: input.assignmentId,
      studentId: input.studentId,
      mode: input.mode,
      correctAnswers: wordResults.reduce(
        (total, result) => total + result.correctAnswers,
        0,
      ),
      wrongAnswers: wordResults.reduce(
        (total, result) => total + result.wrongAnswers,
        0,
      ),
      wordResults,
    };
  },

  async listPracticeAttempts(): Promise<StoredPracticeAttempt[]> {
    return clone(practiceAttempts);
  },

  clearPracticeAttempts() {
    practiceAttempts.length = 0;
    practiceAttemptSequence = 0;
  },
};

export const analyticsService = {
  async getTeacherAnalytics(): Promise<TeacherAnalytics> {
    const problemWords =
      practiceAttempts.length > 0
        ? aggregateProblemWordsFromAttempts(practiceAttempts)
        : aggregateProblemWords(mockClassDetails);

    return {
      totalStudents: mockClassDetails.reduce(
        (total, classItem) => total + classItem.students,
        0,
      ),
      totalWordSets: mockClassDetails.reduce(
        (total, classItem) => total + classItem.wordSets,
        0,
      ),
      averageProgress: getAverage(
        mockClassDetails.map((classItem) => classItem.progress),
      ),
      classProgress: clone(mockClassDetails),
      problemWords,
    };
  },
};

function createInitialAssignments() {
  return mockClassDetails.flatMap((classItem) =>
    classItem.wordSetsList.map((wordSet) => ({
      id: wordSet.id,
      classId: classItem.id,
      wordSetId: getAssignmentWordSetId(wordSet.id),
      assignedAt: "2026-05-17T00:00:00.000Z",
    })),
  );
}

function createAssignmentRecord(input: AssignmentInput) {
  getRequiredClassDetails(input.classId);
  getRequiredWordSetDetails(input.wordSetId);

  const id = `${input.classId}-${input.wordSetId}`;
  const existingAssignment = assignments.find(
    (assignment) => assignment.id === id,
  );

  if (existingAssignment) {
    return existingAssignment;
  }

  const assignment = {
    id,
    classId: input.classId,
    wordSetId: input.wordSetId,
    assignedAt: new Date().toISOString(),
  };

  assignments.push(assignment);
  return assignment;
}

function toStudentWordSet(assignment: MockAssignment) {
  const classDetails = getMockClassDetails(assignment.classId);
  const wordSetDetails = getMockWordSetDetails(assignment.wordSetId);

  if (!classDetails || !wordSetDetails) {
    return undefined;
  }

  return {
    id: assignment.id,
    classId: classDetails.id,
    className: classDetails.name,
    title: wordSetDetails.title,
    words: wordSetDetails.words,
    completedWords: 0,
    progress: 0,
    dueLabel: "Practice today",
  };
}

function getAssignmentWordSetId(assignmentId: string) {
  const [, ...wordSetIdParts] = assignmentId.split("-");

  return wordSetIdParts.join("-");
}

function normalizeAttemptStatus(
  attempt: PracticeAttemptInput,
): StoredPracticeAttempt["status"] {
  if (attempt.status) {
    return attempt.status;
  }

  return attempt.correct ? "correct" : "wrong";
}

function aggregateProblemWordsFromAttempts(attempts: StoredPracticeAttempt[]) {
  const wordsById = new Map<
    string,
    MockProblemWord & { studentIds: Set<string> }
  >();

  for (const attempt of attempts) {
    const word = getMockWord(attempt.wordId);

    if (!word) {
      continue;
    }

    const existing = wordsById.get(attempt.wordId) ?? {
      id: word.id,
      term: word.term,
      translation: word.translation,
      wrongAnswers: 0,
      correctAnswers: 0,
      affectedStudents: 0,
      studentIds: new Set<string>(),
    };

    if (attempt.status === "correct") {
      existing.correctAnswers += 1;
    } else {
      existing.wrongAnswers += 1;
      existing.studentIds.add(attempt.studentId);
    }

    existing.affectedStudents = existing.studentIds.size;
    wordsById.set(attempt.wordId, existing);
  }

  return [...wordsById.values()]
    .filter((word) => word.wrongAnswers > 0)
    .map((word) => ({
      id: word.id,
      term: word.term,
      translation: word.translation,
      wrongAnswers: word.wrongAnswers,
      correctAnswers: word.correctAnswers,
      affectedStudents: word.affectedStudents,
    }))
    .sort((a, b) => getMistakeRate(b) - getMistakeRate(a));
}

function getMockWord(wordId: string) {
  for (const wordSet of mockWordSetDetails) {
    const word = wordSet.wordsList.find((item) => item.id === wordId);

    if (word) {
      return word;
    }
  }

  return undefined;
}

function aggregateProblemWords(classDetails: MockClassDetails[]) {
  const wordsByTerm = new Map<string, MockProblemWord>();

  for (const classItem of classDetails) {
    for (const word of classItem.problemWords) {
      const existing = wordsByTerm.get(word.term);

      if (!existing) {
        wordsByTerm.set(word.term, { ...word });
        continue;
      }

      existing.correctAnswers += word.correctAnswers;
      existing.wrongAnswers += word.wrongAnswers;
      existing.affectedStudents += word.affectedStudents;
    }
  }

  return [...wordsByTerm.values()].sort(
    (a, b) => getMistakeRate(b) - getMistakeRate(a),
  );
}

function getRequiredClassDetails(id: string) {
  const classDetails = getMockClassDetails(id);

  if (!classDetails) {
    throw new Error("Class not found");
  }

  return clone(classDetails);
}

function getRequiredWordSetDetails(id: string) {
  const wordSet = getMockWordSetDetails(id);

  if (!wordSet) {
    throw new Error("Word set not found");
  }

  return clone(wordSet);
}

function clone<T>(value: T): T {
  if (value === undefined) {
    return value;
  }

  return structuredClone(value);
}
