import { notFound } from "next/navigation";
import { ClassDetailsPage } from "@/features/teacher/classes/class-details-page";
import { classesService, wordSetsService } from "@/services";

interface TeacherClassPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TeacherClassPage({
  params,
}: TeacherClassPageProps) {
  const { id } = await params;
  const [classDetails, wordSetSummaries] = await Promise.all([
    classesService.getClassDetails(id),
    wordSetsService.listWordSetSummaries(),
  ]);

  if (!classDetails) {
    notFound();
  }

  return (
    <ClassDetailsPage
      classDetails={classDetails}
      wordSetSummaries={wordSetSummaries}
    />
  );
}
