import { notFound } from "next/navigation";
import { WordSetDetailsPage } from "@/features/teacher/word-sets/word-set-details-page";
import { classesService, wordSetsService } from "@/services";

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
  const [wordSet, classes] = await Promise.all([
    wordSetsService.getWordSetDetails(id),
    classesService.listClasses(),
  ]);

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
      classes={classes}
      backHref={backHref}
      backLabel={backLabel}
    />
  );
}
