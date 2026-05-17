import { StudentProgressPage } from "@/features/student/progress/student-progress-page";
import { studentService } from "@/services";

export default async function StudentProgressRoute() {
  const progressWords = await studentService.listProgressWords();

  return <StudentProgressPage progressWords={progressWords} />;
}
