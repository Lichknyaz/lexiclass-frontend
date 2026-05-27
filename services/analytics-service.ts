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

export interface AnalyticsService {
  getTeacherAnalytics(classId?: string): Promise<TeacherAnalytics>;
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
    async getTeacherAnalytics(classId) {
      if (!usesBackend()) {
        return mockAnalyticsService.getTeacherAnalytics();
      }

      const query = classId ? `?classId=${encodeURIComponent(classId)}` : "";

      return client.get<TeacherAnalytics>(`/teacher/analytics${query}`);
    },
  };
}

export const analyticsService = createAnalyticsService();
