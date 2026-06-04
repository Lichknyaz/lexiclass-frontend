export interface MockClassSummary {
  id: string;
  name: string;
  students: number;
  wordSets: number;
  progress: number;
}

export interface MockStudent {
  id: string;
  name: string;
  email: string;
  progress: number;
  correctAnswers: number;
  wrongAnswers: number;
  lastPracticedAt: string;
}

export interface MockWordSet {
  id: string;
  classId: string;
  title: string;
  description: string;
  words: number;
  assignedStudents: number;
  averageProgress: number;
}

export interface MockWord {
  id: string;
  term: string;
  translation: string;
  exampleSentence: string;
  transcription?: string | null;
  masteryLevel: number;
  correctAnswers: number;
  wrongAnswers: number;
}

export interface MockWordSetDetails extends MockWordSet {
  className: string;
  createdAt: string;
  wordsList: MockWord[];
}

export interface MockWordSetSummary {
  id: string;
  title: string;
  description: string;
  words: number;
  assignedClasses: number;
}

export interface MockProblemWord {
  id: string;
  term: string;
  translation: string;
  wrongAnswers: number;
  correctAnswers: number;
  affectedStudents: number;
}

export interface MockClassDetails extends MockClassSummary {
  inviteCode: string;
  level: string;
  description: string;
  studentsList: MockStudent[];
  wordSetsList: MockWordSet[];
  problemWords: MockProblemWord[];
}

export interface MockStudentClass {
  id: string;
  name: string;
  teacherName: string;
  level: string;
  progress: number;
  wordSets: MockStudentWordSet[];
}

export interface MockStudentWordSet {
  id: string;
  classId: string;
  className: string;
  title: string;
  words: number;
  completedWords: number;
  progress: number;
  dueLabel: string;
}

export interface MockStudentProgressWord {
  id: string;
  assignmentId: string;
  term: string;
  translation: string;
  masteryLevel: number;
  correctCount: number;
  wrongCount: number;
  lastPracticedAt: string;
}
