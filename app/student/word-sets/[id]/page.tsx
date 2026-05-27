import { StudentWordSetDetailsClientPage } from "@/features/student/student-client-pages";

interface StudentWordSetRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StudentWordSetRoute({
  params,
}: StudentWordSetRouteProps) {
  const { id } = await params;

  return <StudentWordSetDetailsClientPage id={id} />;
}
