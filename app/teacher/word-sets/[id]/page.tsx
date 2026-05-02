import { notFound } from "next/navigation";
import { WordSetDetailsPage } from "@/components/dashboard/word-set-details-page";
import { getMockWordSetDetails } from "@/lib/mock-data";

interface TeacherWordSetPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TeacherWordSetPage({
  params,
}: TeacherWordSetPageProps) {
  const { id } = await params;
  const wordSet = getMockWordSetDetails(id);

  if (!wordSet) {
    notFound();
  }

  return <WordSetDetailsPage wordSet={wordSet} />;
}
