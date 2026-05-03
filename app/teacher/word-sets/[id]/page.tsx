import { notFound } from "next/navigation";
import { WordSetDetailsPage } from "@/features/teacher/word-sets/word-set-details-page";
import { getMockWordSetDetails } from "@/mock/mock-data";

interface TeacherWordSetPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    from?: string;
  }>;
}

export default async function TeacherWordSetPage({
  params,
  searchParams,
}: TeacherWordSetPageProps) {
  const { id } = await params;
  const { from } = await searchParams;
  const wordSet = getMockWordSetDetails(id);

  if (!wordSet) {
    notFound();
  }

  const backHref =
    from === "word-sets"
      ? "/teacher/word-sets"
      : `/teacher/classes/${wordSet.classId}`;
  const backLabel = from === "word-sets" ? "Back to word sets" : "Back to class";

  return (
    <WordSetDetailsPage
      wordSet={wordSet}
      backHref={backHref}
      backLabel={backLabel}
    />
  );
}
