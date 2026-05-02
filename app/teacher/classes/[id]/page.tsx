import { notFound } from "next/navigation";
import { ClassDetailsPage } from "@/components/dashboard/class-details-page";
import { getMockClassDetails } from "@/lib/mock-data";

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
