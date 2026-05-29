import { getMockWordSetDetails } from "../mock/mock-data.ts";
import type {
  MockStudentClass,
  MockStudentProgressWord,
  MockStudentWordSet,
  MockWordSetDetails,
} from "../types/mock.ts";
import type { ApiClient } from "./api-client.ts";
import { studentService as mockStudentService } from "./mock-services.ts";
import {
  apiClient,
  isBackendMode,
  type DataSource,
} from "./service-runtime.ts";
import { formatLastPracticedAt } from "../utils/date-time.ts";

interface BackendStudentProgressWord
  extends Omit<MockStudentProgressWord, "lastPracticedAt"> {
  lastPracticedAt: string | null;
}

export interface StudentService {
  listJoinedClasses(): Promise<MockStudentClass[]>;
  listAssignedWordSets(): Promise<MockStudentWordSet[]>;
  getAssignedWordSet(id: string): Promise<MockStudentWordSet | undefined>;
  getAssignedWordSetDetails(
    assignmentId: string,
  ): Promise<MockWordSetDetails | undefined>;
  listProgressWords(): Promise<MockStudentProgressWord[]>;
  joinClass(inviteCode: string): Promise<MockStudentClass>;
}

export function createStudentService({
  client = apiClient,
  dataSource,
}: {
  client?: ApiClient;
  dataSource?: DataSource;
} = {}): StudentService {
  const usesBackend = () => dataSource === "backend" || (!dataSource && isBackendMode());

  return {
    async listJoinedClasses() {
      if (!usesBackend()) {
        return mockStudentService.listJoinedClasses();
      }

      return client.get<MockStudentClass[]>("/student/classes");
    },

    async listAssignedWordSets() {
      if (!usesBackend()) {
        return mockStudentService.listAssignedWordSets();
      }

      return client.get<MockStudentWordSet[]>("/student/assignments");
    },

    async getAssignedWordSet(id) {
      const assignedWordSets = await this.listAssignedWordSets();

      return assignedWordSets.find((wordSet) => wordSet.id === id);
    },

    async getAssignedWordSetDetails(assignmentId) {
      if (!usesBackend()) {
        const assignedWordSet = await mockStudentService.getAssignedWordSet(
          assignmentId,
        );

        if (!assignedWordSet) {
          return undefined;
        }

        return getMockWordSetDetails(
          getMockWordSetIdFromAssignmentId(assignmentId),
        );
      }

      return client.get<MockWordSetDetails>(
        `/student/word-sets/${assignmentId}`,
      );
    },

    async listProgressWords() {
      if (!usesBackend()) {
        return mockStudentService.listProgressWords();
      }

      const words = await client.get<BackendStudentProgressWord[]>(
        "/student/progress/words",
      );

      return words.map((word) => ({
        ...word,
        lastPracticedAt: formatLastPracticedAt(word.lastPracticedAt),
      }));
    },

    async joinClass(inviteCode) {
      if (!usesBackend()) {
        return mockStudentService.joinClass(inviteCode);
      }

      return client.post<MockStudentClass, { inviteCode: string }>(
        "/student/classes/join",
        { inviteCode },
      );
    },
  };
}

export const studentService = createStudentService();

function getMockWordSetIdFromAssignmentId(assignmentId: string) {
  return assignmentId.slice(assignmentId.indexOf("-") + 1);
}
