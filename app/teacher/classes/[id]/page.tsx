import { notFound } from "next/navigation";
import { ClassDetailsPage } from "@/features/teacher/classes/class-details-page";
import { getMockClassDetails } from "@/mock/mock-data";

interface TeacherClassPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TeacherClassPage({
  params,
}: TeacherClassPageProps) {
  const { id } = await params;
  const classDetails = getMockClassDetails(id);

  if (!classDetails) {
    notFound();
  }

  return <ClassDetailsPage classDetails={classDetails} />;
}
