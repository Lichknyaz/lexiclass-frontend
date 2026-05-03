"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, BookOpen, TrendingDown, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { Sidebar } from "@/components/dashboard/sidebar";
import { mockClassDetails } from "@/mock/mock-data";
import type { MockProblemWord } from "@/types/mock";
import { getAverage, getMistakeRate } from "@/utils";

export function TeacherAnalyticsPage() {
  const router = useRouter();
  const [selectedClassId, setSelectedClassId] = useState("all");

  const filteredClasses = useMemo(
    () =>
      selectedClassId === "all"
        ? mockClassDetails
        : mockClassDetails.filter(
            (classItem) => classItem.id === selectedClassId,
          ),
    [selectedClassId],
  );
  const problemWords = useMemo(
    () => getProblemWordsForClasses(filteredClasses),
    [filteredClasses],
  );

  const totalStudents = filteredClasses.reduce(
    (total, classItem) => total + classItem.students,
    0,
  );
  const totalWordSets = filteredClasses.reduce(
    (total, classItem) => total + classItem.wordSets,
    0,
  );
  const averageProgress = getAverage(
    filteredClasses.map((classItem) => classItem.progress),
  );

  return (
    <div className="flex h-screen">
      <Sidebar className="hidden lg:flex" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <MobileSidebar />
            <h1 className="text-xl font-semibold">Analytics</h1>
          </div>
          <div className="flex justify-end">
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {mockClassDetails.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="flex flex-col gap-4">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                icon={Users}
                label="Students"
                value={totalStudents}
              />
              <SummaryCard
                icon={BookOpen}
                label="Word sets"
                value={totalWordSets}
              />
              <SummaryCard
                icon={BarChart3}
                label="Average progress"
                value={`${averageProgress}%`}
              />
              <SummaryCard
                icon={TrendingDown}
                label="Problem words"
                value={problemWords.length}
              />
            </section>

            <section>
              <Card>
                <CardHeader>
                  <CardTitle>Class Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Class</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Word sets</TableHead>
                        <TableHead>Progress</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClasses.map((classItem) => (
                        <TableRow
                          key={classItem.id}
                          className="cursor-pointer"
                          onClick={() =>
                            router.push(`/teacher/classes/${classItem.id}`)
                          }
                        >
                          <TableCell className="font-medium">
                            {classItem.name}
                          </TableCell>
                          <TableCell>{classItem.students}</TableCell>
                          <TableCell>{classItem.wordSets}</TableCell>
                          <TableCell className="min-w-40">
                            <div className="flex items-center gap-3">
                              <Progress
                                value={classItem.progress}
                                className="h-2"
                              />
                              <span className="w-10 text-right text-sm font-medium">
                                {classItem.progress}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </section>

            <section>
              <Card>
                <CardHeader>
                  <CardTitle>Problem Words</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {problemWords.map((word) => {
                      const wrongRate = getMistakeRate(word);

                      return (
                        <div key={word.id} className="rounded-lg border p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-medium">{word.term}</div>
                              <div className="text-sm text-muted-foreground">
                                {word.className}
                              </div>
                            </div>
                            <span className="shrink-0 text-sm font-medium text-destructive">
                              {wrongRate}% wrong
                            </span>
                          </div>
                          <Progress
                            value={wrongRate}
                            className="mt-3 h-2 [&_[data-slot=progress-indicator]]:bg-destructive"
                          />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

interface AnalyticsProblemWord extends MockProblemWord {
  className: string;
}

function getProblemWordsForClasses(
  classes: typeof mockClassDetails,
): AnalyticsProblemWord[] {
  return classes.flatMap((classItem) =>
    classItem.problemWords.map((word) => ({
      ...word,
      id: `${classItem.id}-${word.id}`,
      className: classItem.name,
    })),
  );
}

interface SummaryCardProps {
  icon: typeof Users;
  label: string;
  value: number | string;
}

function SummaryCard({ icon: Icon, label, value }: SummaryCardProps) {
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
