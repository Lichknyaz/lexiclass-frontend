import { notFound } from "next/navigation";
import { PracticePage } from "@/components/student/practice-page";
import { getMockStudentWordSet } from "@/lib/mock-data";

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
