import type {
  MockClassDetails,
  MockClassSummary,
  MockStudent,
  MockWordSet,
  MockWordSetSummary,
} from "../types/mock.ts";
import type { ApiClient } from "./api-client.ts";
import {
  classesService as mockClassesService,
  type ClassOverviewInput,
  type CreateClassInput,
  type StudentInput,
  type StudentProfileInput,
} from "./mock-services.ts";
import {
  apiClient,
  isBackendMode,
  type DataSource,
} from "./service-runtime.ts";
import { formatLastPracticedAt } from "../utils/date-time.ts";

export type {
  ClassOverviewInput,
  CreateClassInput,
  StudentInput,
  StudentProfileInput,
};

interface BackendClassDetails
  extends Omit<MockClassDetails, "studentsList"> {
  studentsList: Array<Omit<MockStudent, "lastPracticedAt"> & {
    lastPracticedAt: string | null;
  }>;
}

export interface ClassesService {
  listClasses(): Promise<MockClassSummary[]>;
  listClassDetails(): Promise<MockClassDetails[]>;
  getClassDetails(id: string): Promise<MockClassDetails | undefined>;
  createClass(input: CreateClassInput): Promise<MockClassSummary>;
  updateClassOverview(
    id: string,
    input: ClassOverviewInput,
  ): Promise<MockClassDetails>;
  deleteClass(id: string): Promise<{ id: string }>;
  addStudent(classId: string, input: StudentInput): Promise<MockStudent>;
  updateStudent(
    classId: string,
    input: StudentProfileInput,
  ): Promise<MockStudent>;
  removeStudent(
    classId: string,
    studentId: string,
  ): Promise<{ studentId: string }>;
  assignWordSet(
    classId: string,
    wordSet: MockWordSetSummary,
  ): Promise<MockWordSet>;
}

export function createClassesService({
  client = apiClient,
  dataSource,
}: {
  client?: ApiClient;
  dataSource?: DataSource;
} = {}): ClassesService {
  const usesBackend = () => dataSource === "backend" || (!dataSource && isBackendMode());

  async function getBackendClassDetails(classId: string) {
    return normalizeClassDetails(
      await client.get<BackendClassDetails>(`/teacher/classes/${classId}`),
    );
  }

  return {
    async listClasses() {
      if (!usesBackend()) {
        return mockClassesService.listClasses();
      }

      return client.get<MockClassSummary[]>("/teacher/classes");
    },

    async listClassDetails() {
      if (!usesBackend()) {
        return mockClassesService.listClassDetails();
      }

      const classes = await client.get<MockClassSummary[]>("/teacher/classes");

      return Promise.all(
        classes.map((classItem) => getBackendClassDetails(classItem.id)),
      );
    },

    async getClassDetails(id) {
      if (!usesBackend()) {
        return mockClassesService.getClassDetails(id);
      }

      return getBackendClassDetails(id);
    },

    async createClass(input) {
      if (!usesBackend()) {
        return mockClassesService.createClass(input);
      }

      return client.post<MockClassSummary, CreateClassInput>(
        "/teacher/classes",
        input,
      );
    },

    async updateClassOverview(id, input) {
      if (!usesBackend()) {
        return mockClassesService.updateClassOverview(id, input);
      }

      return normalizeClassDetails(
        await client.put<BackendClassDetails, ClassOverviewInput>(
          `/teacher/classes/${id}`,
          input,
        ),
      );
    },

    async deleteClass(id) {
      if (!usesBackend()) {
        return mockClassesService.deleteClass(id);
      }

      return client.delete<{ id: string }>(`/teacher/classes/${id}`);
    },

    async addStudent(classId, input) {
      if (!usesBackend()) {
        return mockClassesService.addStudent(classId, input);
      }

      return normalizeStudent(
        await client.post<BackendClassDetails["studentsList"][number], StudentInput>(
          `/teacher/classes/${classId}/students`,
          input,
        ),
      );
    },

    async updateStudent(classId, input) {
      if (!usesBackend()) {
        return mockClassesService.updateStudent(classId, input);
      }

      const { id, ...body } = input;

      return normalizeStudent(
        await client.put<BackendClassDetails["studentsList"][number], StudentInput>(
          `/teacher/classes/${classId}/students/${id}`,
          body,
        ),
      );
    },

    async removeStudent(classId, studentId) {
      if (!usesBackend()) {
        return mockClassesService.removeStudent(classId, studentId);
      }

      return client.delete<{ studentId: string }>(
        `/teacher/classes/${classId}/students/${studentId}`,
      );
    },

    async assignWordSet(classId, wordSet) {
      if (!usesBackend()) {
        return mockClassesService.assignWordSet(classId, wordSet);
      }

      const assignment = await client.post<
        { id: string; classId: string; wordSetId: string },
        { classId: string; wordSetId: string }
      >("/teacher/assignments", {
        classId,
        wordSetId: wordSet.id,
      });
      const classDetails = await getBackendClassDetails(classId);

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
}

export const classesService = createClassesService();

function normalizeClassDetails(details: BackendClassDetails): MockClassDetails {
  return {
    ...details,
    studentsList: details.studentsList.map(normalizeStudent),
  };
}

function normalizeStudent(
  student: BackendClassDetails["studentsList"][number],
): MockStudent {
  return {
    ...student,
    lastPracticedAt: formatLastPracticedAt(student.lastPracticedAt),
  };
}
