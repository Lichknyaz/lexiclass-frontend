import { StudentPracticeClientPage } from "@/features/student/student-client-pages";

interface StudentPracticeRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StudentPracticeRoute({
  params,
}: StudentPracticeRouteProps) {
  const { id } = await params;

  return <StudentPracticeClientPage id={id} />;
}
