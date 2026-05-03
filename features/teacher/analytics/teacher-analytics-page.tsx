"use client";

import { BarChart3, BookOpen, TrendingDown, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import { getAverage, getMistakeRate } from "@/utils";

export function TeacherAnalyticsPage() {
  const totalStudents = mockClassDetails.reduce(
    (total, classItem) => total + classItem.students,
    0,
  );
  const totalWordSets = mockClassDetails.reduce(
    (total, classItem) => total + classItem.wordSets,
    0,
  );
  const averageProgress = getAverage(
    mockClassDetails.map((classItem) => classItem.progress),
  );
  const problemWords = mockClassDetails[0]?.problemWords ?? [];

  return (
    <div className="flex h-screen">
      <Sidebar className="hidden lg:flex" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <MobileSidebar />
            <h1 className="text-xl font-semibold">Analytics</h1>
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

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
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
                      {mockClassDetails.map((classItem) => (
                        <TableRow key={classItem.id}>
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

              <Card>
                <CardHeader>
                  <CardTitle>Top Problem Words</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {problemWords.map((word) => {
                    const wrongRate = getMistakeRate(word);

                    return (
                      <div key={word.id} className="rounded-lg border p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium">{word.term}</div>
                            <div className="text-sm text-muted-foreground">
                              {word.translation}
                            </div>
                          </div>
                          <span className="text-sm font-medium text-destructive">
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
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </div>
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
