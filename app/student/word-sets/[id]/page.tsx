import { notFound } from "next/navigation";
import { StudentWordSetDetailsPage } from "@/features/student/word-sets/student-word-set-details-page";
import { getMockStudentWordSet } from "@/mock/mock-data";

interface StudentWordSetRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StudentWordSetRoute({
  params,
}: StudentWordSetRouteProps) {
  const { id } = await params;
  const wordSet = getMockStudentWordSet(id);

  if (!wordSet) {
    notFound();
  }

  return <StudentWordSetDetailsPage wordSet={wordSet} />;
}
