import { notFound } from "next/navigation";
import { StudentWordSetDetailsPage } from "@/features/student/word-sets/student-word-set-details-page";
import { studentService, wordSetsService } from "@/services";

interface StudentWordSetRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StudentWordSetRoute({
  params,
}: StudentWordSetRouteProps) {
  const { id } = await params;
  const [wordSet, wordSetDetails] = await Promise.all([
    studentService.getAssignedWordSet(id),
    wordSetsService.getWordSetDetails(id),
  ]);

  if (!wordSet) {
    notFound();
  }

  return (
    <StudentWordSetDetailsPage
      wordSet={wordSet}
      words={wordSetDetails?.wordsList ?? []}
    />
  );
}
