import { TeacherWordSetDetailsClientPage } from "@/features/teacher/teacher-client-pages";

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
  const [{ id }, { from }] = await Promise.all([params, searchParams]);

  return <TeacherWordSetDetailsClientPage id={id} from={from} />;
}
