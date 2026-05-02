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
  title: string;
  description: string;
  words: number;
  assignedStudents: number;
  averageProgress: number;
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

export const mockClasses: MockClassSummary[] = [
  { id: "1", name: "English A2", students: 12, wordSets: 4, progress: 68 },
  { id: "2", name: "English B1", students: 8, wordSets: 3, progress: 74 },
  { id: "3", name: "Kids Group", students: 15, wordSets: 5, progress: 52 },
  { id: "4", name: "Travel Vocabulary", students: 6, wordSets: 2, progress: 81 },
];

const defaultStudents: MockStudent[] = [
  {
    id: "s1",
    name: "Anna Kovalenko",
    email: "anna.k@example.com",
    progress: 82,
    correctAnswers: 148,
    wrongAnswers: 28,
    lastPracticedAt: "Today",
  },
  {
    id: "s2",
    name: "Matej Novak",
    email: "matej.n@example.com",
    progress: 69,
    correctAnswers: 112,
    wrongAnswers: 41,
    lastPracticedAt: "Yesterday",
  },
  {
    id: "s3",
    name: "Sofia Hrushka",
    email: "sofia.h@example.com",
    progress: 57,
    correctAnswers: 86,
    wrongAnswers: 38,
    lastPracticedAt: "2 days ago",
  },
  {
    id: "s4",
    name: "Daniel Weber",
    email: "daniel.w@example.com",
    progress: 44,
    correctAnswers: 61,
    wrongAnswers: 46,
    lastPracticedAt: "4 days ago",
  },
];

const defaultWordSets: MockWordSet[] = [
  {
    id: "w1",
    title: "Daily routines",
    description: "Common verbs and phrases for everyday activities.",
    words: 24,
    assignedStudents: 12,
    averageProgress: 76,
  },
  {
    id: "w2",
    title: "Food and restaurants",
    description: "Ordering, ingredients, and restaurant vocabulary.",
    words: 32,
    assignedStudents: 12,
    averageProgress: 63,
  },
  {
    id: "w3",
    title: "Past simple verbs",
    description: "Regular and irregular verbs for simple past stories.",
    words: 28,
    assignedStudents: 10,
    averageProgress: 58,
  },
];

const defaultProblemWords: MockProblemWord[] = [
  {
    id: "p1",
    term: "borrow",
    translation: "půjčit si",
    wrongAnswers: 34,
    correctAnswers: 42,
    affectedStudents: 7,
  },
  {
    id: "p2",
    term: "receipt",
    translation: "účtenka",
    wrongAnswers: 29,
    correctAnswers: 38,
    affectedStudents: 6,
  },
  {
    id: "p3",
    term: "appointment",
    translation: "schůzka",
    wrongAnswers: 24,
    correctAnswers: 51,
    affectedStudents: 5,
  },
];

export const mockClassDetails: MockClassDetails[] = mockClasses.map(
  (classItem, index) => ({
    ...classItem,
    inviteCode: ["A2-7KQ9", "B1-M4TN", "KIDS-82P", "TRVL-5HD"][index],
    level: ["A2", "B1", "Beginner", "A2-B1"][index],
    description: [
      "Core vocabulary practice for adult learners building everyday fluency.",
      "Intermediate vocabulary class focused on conversation and accuracy.",
      "Vocabulary practice for young learners with short themed word sets.",
      "Practical travel vocabulary for airports, hotels, food, and directions.",
    ][index],
    studentsList: defaultStudents.slice(0, Math.min(4, classItem.students)),
    wordSetsList: defaultWordSets.slice(0, Math.min(3, classItem.wordSets)),
    problemWords: defaultProblemWords,
  }),
);

export function getMockClassDetails(id: string) {
  return mockClassDetails.find((classItem) => classItem.id === id);
}
