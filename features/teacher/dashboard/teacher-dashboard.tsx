"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  ListChecks,
  Plus,
  UserRoundCheck,
  Users,
} from "lucide-react";
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
import { type MockClassDetails, type MockStudent } from "@/types/mock";
import { getAverage } from "@/utils";

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

        <main className="flex-1 overflow-auto p-4 lg:p-6">
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
              <Card className="h-full xl:col-span-4">
                <CardHeader className="pb-2">
                  <CardTitle>Class Progress</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="max-h-[260px] overflow-y-auto rounded-lg border">
                    <div className="divide-y">
                      {mockClassDetails.slice(0, 3).map((classItem) => (
                        <ClassProgressRow
                          key={classItem.id}
                          classItem={classItem}
                          onOpen={() =>
                            router.push(`/teacher/classes/${classItem.id}`)
                          }
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="h-full xl:col-span-4">
                <StudentsPreview
                  title="Top Performing Students"
                  students={topStudents}
                />
              </div>
              <div className="h-full xl:col-span-4">
                <StudentsPreview
                  title="Lowest Progress"
                  students={lowestStudents}
                />
              </div>
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

function ClassProgressRow({
  classItem,
  onOpen,
}: {
  classItem: MockClassDetails;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      className="w-full cursor-pointer px-4 py-2 text-left transition-colors hover:bg-muted/40"
      onClick={onOpen}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium">{classItem.name}</div>
          <div className="text-sm text-muted-foreground">
            {classItem.students} students / {classItem.wordSets} word sets
          </div>
        </div>
        <span className="shrink-0 text-sm font-medium">
          {classItem.progress}%
        </span>
      </div>
      <Progress value={classItem.progress} className="mt-1.5 h-1.5" />
    </button>
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
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="max-h-[260px] overflow-y-auto rounded-lg border">
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

function getStudentPreviewData(): StudentPreview[] {
  return mockClassDetails.flatMap((classItem) =>
    classItem.studentsList.map((student) => ({
      ...student,
      className: classItem.name,
    })),
  );
}
