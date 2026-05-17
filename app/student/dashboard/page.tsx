import { StudentDashboardPage } from "@/features/student/dashboard/student-dashboard-page";
import { studentService } from "@/services";

export default async function StudentDashboardRoute() {
  const [joinedClasses, assignedWordSets] = await Promise.all([
    studentService.listJoinedClasses(),
    studentService.listAssignedWordSets(),
  ]);

  return (
    <StudentDashboardPage
      joinedClasses={joinedClasses}
      assignedWordSets={assignedWordSets}
    />
  );
}
