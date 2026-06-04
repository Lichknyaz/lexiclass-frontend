import { StudentPracticeClientPage } from "@/features/student/student-client-pages";

interface StudentPracticeRouteProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    mode?: string;
  }>;
}

export default async function StudentPracticeRoute({
  params,
  searchParams,
}: StudentPracticeRouteProps) {
  const { id } = await params;
  const { mode } = await searchParams;

  return (
    <StudentPracticeClientPage
      id={id}
      initialWordScope={mode === "weak" ? "weak" : "all"}
    />
  );
}
