import { TeacherClassDetailsClientPage } from "@/features/teacher/teacher-client-pages";

interface TeacherClassPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TeacherClassPage({
  params,
}: TeacherClassPageProps) {
  const { id } = await params;

  return <TeacherClassDetailsClientPage id={id} />;
}
