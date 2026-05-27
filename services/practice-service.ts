import type { ApiClient } from "./api-client.ts";
import {
  practiceService as mockPracticeService,
  type PracticeAttemptInput,
  type PracticeSessionResult,
  type PracticeWordResult,
  type SavePracticeSessionInput,
  type StoredPracticeAttempt,
} from "./mock-services.ts";
import {
  apiClient,
  isBackendMode,
  type DataSource,
} from "./service-runtime.ts";

export type {
  PracticeAttemptInput,
  PracticeSessionResult,
  PracticeWordResult,
  SavePracticeSessionInput,
  StoredPracticeAttempt,
};

type BackendPracticeMode = "flashcard" | "multiple_choice" | "writing";

interface BackendSavePracticeSessionInput
  extends Omit<SavePracticeSessionInput, "mode" | "studentId"> {
  mode: BackendPracticeMode;
}

interface BackendPracticeSessionResult
  extends Omit<PracticeSessionResult, "mode"> {
  mode: BackendPracticeMode;
}

export interface PracticeService {
  savePracticeSession(
    input: SavePracticeSessionInput,
  ): Promise<PracticeSessionResult>;
  listPracticeAttempts(): Promise<StoredPracticeAttempt[]>;
  clearPracticeAttempts(): void;
}

export function createPracticeService({
  client = apiClient,
  dataSource,
}: {
  client?: ApiClient;
  dataSource?: DataSource;
} = {}): PracticeService {
  const usesBackend = () => dataSource === "backend" || (!dataSource && isBackendMode());

  return {
    async savePracticeSession(input) {
      if (!usesBackend()) {
        return mockPracticeService.savePracticeSession(input);
      }

      const result = await client.post<
        BackendPracticeSessionResult,
        BackendSavePracticeSessionInput
      >("/student/practice-sessions", {
        assignmentId: input.assignmentId,
        attempts: input.attempts,
        mode: toBackendPracticeMode(input.mode),
      });

      return {
        ...result,
        mode: toFrontendPracticeMode(result.mode),
      };
    },

    async listPracticeAttempts() {
      if (!usesBackend()) {
        return mockPracticeService.listPracticeAttempts();
      }

      return [];
    },

    clearPracticeAttempts() {
      if (!usesBackend()) {
        mockPracticeService.clearPracticeAttempts();
      }
    },
  };
}

export const practiceService = createPracticeService();

function toBackendPracticeMode(
  mode: SavePracticeSessionInput["mode"],
): BackendPracticeMode {
  return mode === "multiple-choice" ? "multiple_choice" : mode;
}

function toFrontendPracticeMode(
  mode: BackendPracticeMode,
): SavePracticeSessionInput["mode"] {
  return mode === "multiple_choice" ? "multiple-choice" : mode;
}
