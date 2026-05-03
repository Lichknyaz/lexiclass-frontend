import { notFound } from "next/navigation";
import { PracticePage } from "@/features/student/practice/practice-page";
import { getMockStudentWordSet } from "@/mock/mock-data";

interface StudentPracticeRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StudentPracticeRoute({
  params,
}: StudentPracticeRouteProps) {
  const { id } = await params;
  const wordSet = getMockStudentWordSet(id);

  if (!wordSet) {
    notFound();
  }

  return <PracticePage wordSet={wordSet} />;
}
