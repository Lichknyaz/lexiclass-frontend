"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  ListChecks,
  Plus,
  TrendingDown,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CreateClassDialog } from "@/components/dashboard/create-class-dialog";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { Sidebar } from "@/components/dashboard/sidebar";
import {
  mockClassDetails,
  mockClasses,
  mockWordSetSummaries,
} from "@/mock/mock-data";
import {
  type MockProblemWord,
  type MockStudent,
} from "@/types/mock";
import { getAverage, getMistakeRate } from "@/utils";

export function TeacherDashboard() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const totalStudents = mockClasses.reduce(
    (total, classItem) => total + classItem.students,
    0,
  );
  const averageProgress = getAverage(
    mockClasses.map((classItem) => classItem.progress),
  );
  const problemWords = useMemo(() => getTopProblemWords(), []);
  const students = useMemo(() => getStudentPreviewData(), []);
  const topStudents = [...students]
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);
  const lowestStudents = [...students]
    .sort((a, b) => a.progress - b.progress)
    .slice(0, 3);

  return (
    <div className="flex h-screen">
      <Sidebar className="hidden lg:flex" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <MobileSidebar />
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="flex flex-col gap-4">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatsCard
                icon={BookOpen}
                label="Total classes"
                value={mockClasses.length}
              />
              <StatsCard
                icon={Users}
                label="Total students"
                value={totalStudents}
              />
              <StatsCard
                icon={ListChecks}
                label="Total word sets"
                value={mockWordSetSummaries.length}
              />
              <StatsCard
                icon={BarChart3}
                label="Average progress"
                value={`${averageProgress}%`}
              />
            </section>

            <section className="grid gap-4 xl:grid-cols-12">
              <Card className="xl:col-span-4">
                <CardHeader className="pb-2">
                  <CardTitle>Problem Words</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="max-h-[260px] overflow-y-auto rounded-lg border">
                    <div className="divide-y">
                      {problemWords.slice(0, 3).map((word) => (
                        <ProblemWordRow key={word.id} word={word} />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="xl:col-span-3">
                <StudentsPreview
                  title="Top Performing Students"
                  students={topStudents}
                />
              </div>
              <div className="xl:col-span-3">
                <StudentsPreview
                  title="Lowest Progress"
                  students={lowestStudents}
                />
              </div>

              <Card className="h-fit self-start xl:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-1.5 px-3 pb-3">
                  <Button size="sm" onClick={() => setDialogOpen(true)}>
                    <Plus className="size-4" />
                    Create Class
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push("/teacher/word-sets")}
                  >
                    <ListChecks className="size-4" />
                    Create Word Set
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push("/teacher/word-sets")}
                  >
                    <UserRoundCheck className="size-4" />
                    Assign Word Set
                  </Button>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>

      <CreateClassDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreate={() => setDialogOpen(false)}
      />
    </div>
  );
}

interface StatsCardProps {
  icon: typeof BookOpen;
  label: string;
  value: number | string;
}

function StatsCard({ icon: Icon, label, value }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="size-4" />
          {label}
        </div>
        <div className="mt-2 text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

function ProblemWordRow({ word }: { word: MockProblemWord }) {
  const mistakeRate = getMistakeRate(word);

  return (
    <div className="px-4 py-2">
      <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
        <div className="min-w-0">
          <div className="font-medium">{word.term}</div>
          <div className="text-sm text-muted-foreground">
            {word.translation}
          </div>
        </div>
        <div>
          <Badge
            variant="outline"
            className="border-destructive/30 text-destructive"
          >
            {mistakeRate}% mistakes
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground md:text-right">
          {word.affectedStudents} students / {word.wrongAnswers} wrong
        </div>
      </div>
      <Progress
        value={mistakeRate}
        className="mt-1.5 h-1.5 [&_[data-slot=progress-indicator]]:bg-destructive"
      />
    </div>
  );
}

interface StudentPreview extends MockStudent {
  className: string;
}

function StudentsPreview({
  title,
  students,
}: {
  title: string;
  students: StudentPreview[];
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="max-h-[220px] overflow-y-auto rounded-lg border">
          <div className="divide-y">
            {students.map((student) => (
              <div
                key={`${student.className}-${student.id}`}
                className="px-4 py-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {student.className}
                    </div>
                  </div>
                  <span
                    className={
                      student.progress < 60
                        ? "text-sm font-medium text-destructive"
                        : "text-sm font-medium"
                    }
                  >
                    {student.progress}%
                  </span>
                </div>
                <Progress
                  value={student.progress}
                  className={
                    student.progress < 60
                      ? "mt-1.5 h-1.5 [&_[data-slot=progress-indicator]]:bg-destructive"
                      : "mt-1.5 h-1.5"
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getTopProblemWords() {
  const wordsByTerm = new Map<string, MockProblemWord>();

  for (const classItem of mockClassDetails) {
    for (const word of classItem.problemWords) {
      const existing = wordsByTerm.get(word.term);

      if (!existing) {
        wordsByTerm.set(word.term, { ...word });
        continue;
      }

      existing.correctAnswers += word.correctAnswers;
      existing.wrongAnswers += word.wrongAnswers;
      existing.affectedStudents += word.affectedStudents;
    }
  }

  return [...wordsByTerm.values()]
    .sort((a, b) => {
      const aRate = getMistakeRate(a);
      const bRate = getMistakeRate(b);

      return bRate - aRate;
    })
    .slice(0, 5);
}

function getStudentPreviewData(): StudentPreview[] {
  return mockClassDetails.flatMap((classItem) =>
    classItem.studentsList.map((student) => ({
      ...student,
      className: classItem.name,
    })),
  );
}
