import {
  assignmentsService as mockAssignmentsService,
  type AssignmentInput,
  type MockAssignment,
} from "./mock-services.ts";
import type { ApiClient } from "./api-client.ts";
import {
  apiClient,
  isBackendMode,
  type DataSource,
} from "./service-runtime.ts";

export type { AssignmentInput, MockAssignment };

export interface AssignmentsService {
  listAssignments(): Promise<MockAssignment[]>;
  createAssignment(input: AssignmentInput): Promise<MockAssignment>;
  resetAssignments(nextAssignments?: MockAssignment[]): void;
}

export function createAssignmentsService({
  client = apiClient,
  dataSource,
}: {
  client?: ApiClient;
  dataSource?: DataSource;
} = {}): AssignmentsService {
  const usesBackend = () => dataSource === "backend" || (!dataSource && isBackendMode());

  return {
    async listAssignments() {
      if (!usesBackend()) {
        return mockAssignmentsService.listAssignments();
      }

      return client.get<MockAssignment[]>("/teacher/assignments");
    },

    async createAssignment(input) {
      if (!usesBackend()) {
        return mockAssignmentsService.createAssignment(input);
      }

      return client.post<MockAssignment, AssignmentInput>(
        "/teacher/assignments",
        input,
      );
    },

    resetAssignments(nextAssignments) {
      if (!usesBackend()) {
        mockAssignmentsService.resetAssignments(nextAssignments);
      }
    },
  };
}

export const assignmentsService = createAssignmentsService();
