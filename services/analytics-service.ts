import type { ApiClient } from "./api-client.ts";
import {
  analyticsService as mockAnalyticsService,
  type TeacherAnalytics,
} from "./mock-services.ts";
import {
  apiClient,
  isBackendMode,
  type DataSource,
} from "./service-runtime.ts";

export type { TeacherAnalytics };

export type ProblemWordWindow = "14" | "30" | "90" | "all";

export interface TeacherAnalyticsOptions {
  classId?: string;
  problemWordWindow?: ProblemWordWindow;
}

export interface AnalyticsService {
  getTeacherAnalytics(
    classIdOrOptions?: string | TeacherAnalyticsOptions,
  ): Promise<TeacherAnalytics>;
}

export function createAnalyticsService({
  client = apiClient,
  dataSource,
}: {
  client?: ApiClient;
  dataSource?: DataSource;
} = {}): AnalyticsService {
  const usesBackend = () => dataSource === "backend" || (!dataSource && isBackendMode());

  return {
    async getTeacherAnalytics(classIdOrOptions) {
      if (!usesBackend()) {
        return mockAnalyticsService.getTeacherAnalytics();
      }

      const options =
        typeof classIdOrOptions === "string"
          ? { classId: classIdOrOptions }
          : classIdOrOptions;
      const query = new URLSearchParams();

      if (options?.classId) {
        query.set("classId", options.classId);
      }

      if (options?.problemWordWindow) {
        query.set("problemWordWindow", options.problemWordWindow);
      }

      const queryString = query.toString() ? `?${query.toString()}` : "";

      return client.get<TeacherAnalytics>(`/teacher/analytics${queryString}`);
    },
  };
}

export const analyticsService = createAnalyticsService();
