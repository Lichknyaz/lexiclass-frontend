import { TeacherWordSetsPage } from "@/features/teacher/word-sets/teacher-word-sets-page";
import { wordSetsService } from "@/services";

export default async function TeacherWordSetsRoute() {
  const wordSets = await wordSetsService.listWordSetSummaries();

  return <TeacherWordSetsPage wordSets={wordSets} />;
}
