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

    return {
      id: `${classId}-${wordSet.id}`,
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
