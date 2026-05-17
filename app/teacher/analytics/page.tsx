import { TeacherAnalyticsPage } from "@/features/teacher/analytics/teacher-analytics-page";
import { analyticsService } from "@/services";

export default async function AnalyticsPage() {
  const analytics = await analyticsService.getTeacherAnalytics();

  return <TeacherAnalyticsPage analytics={analytics} />;
}
