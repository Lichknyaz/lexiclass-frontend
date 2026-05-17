import { TeacherDashboard } from "@/features/teacher/dashboard/teacher-dashboard";
import {
  analyticsService,
  classesService,
  wordSetsService,
} from "@/services";

export default async function TeacherDashboardPage() {
  const [classes, classDetails, wordSets, analytics] = await Promise.all([
    classesService.listClasses(),
    classesService.listClassDetails(),
    wordSetsService.listWordSetSummaries(),
    analyticsService.getTeacherAnalytics(),
  ]);

  return (
    <TeacherDashboard
      classes={classes}
      classDetails={classDetails}
      wordSets={wordSets}
      analytics={analytics}
    />
  );
}
