import { notFound } from "next/navigation";
import { PracticePage } from "@/features/student/practice/practice-page";
import { studentService, wordSetsService } from "@/services";

interface StudentPracticeRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StudentPracticeRoute({
  params,
}: StudentPracticeRouteProps) {
  const { id } = await params;
  const [wordSet, wordSetDetails] = await Promise.all([
    studentService.getAssignedWordSet(id),
    wordSetsService.getWordSetDetails(id),
  ]);

  if (!wordSet) {
    notFound();
  }

  return <PracticePage wordSet={wordSet} words={wordSetDetails?.wordsList ?? []} />;
}
