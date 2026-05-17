import {
  getMockClassDetails,
  getMockStudentWordSet,
  getMockStudentWordSets,
  getMockWordSetDetails,
  mockClassDetails,
  mockClasses,
  mockStudentClasses,
  mockStudentProgressWords,
  mockWordSetSummaries,
} from "../mock/mock-data.ts";
import type {
  MockClassDetails,
  MockClassSummary,
  MockProblemWord,
  MockStudentClass,
  MockStudentProgressWord,
  MockStudentWordSet,
  MockWordSetDetails,
  MockWordSetSummary,
} from "../types/mock.ts";
import { getAverage, getMistakeRate } from "../utils/progress.ts";

export interface CreateClassInput {
  name: string;
}

export interface PracticeAttemptInput {
  wordId: string;
  correct: boolean;
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
};

export const studentService = {
  async listJoinedClasses(): Promise<MockStudentClass[]> {
    return clone(mockStudentClasses);
  },

  async listAssignedWordSets(): Promise<MockStudentWordSet[]> {
    return clone(getMockStudentWordSets());
  },

  async getAssignedWordSet(
    id: string,
  ): Promise<MockStudentWordSet | undefined> {
    return clone(getMockStudentWordSet(id));
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
    const wordResults = input.attempts.map((attempt) => ({
      wordId: attempt.wordId,
      correctAnswers: attempt.correct ? 1 : 0,
      wrongAnswers: attempt.correct ? 0 : 1,
    }));

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
};

export const analyticsService = {
  async getTeacherAnalytics(): Promise<TeacherAnalytics> {
    const problemWords = aggregateProblemWords(mockClassDetails);

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

function clone<T>(value: T): T {
  if (value === undefined) {
    return value;
  }

  return structuredClone(value);
}
