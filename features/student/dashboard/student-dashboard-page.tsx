"use client";

import Link from "next/link";
import { BookOpen, PlusCircle, Target, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StudentShell } from "@/components/student/student-shell";
import { getMockStudentWordSets, mockStudentClasses } from "@/mock/mock-data";
import { getAverage } from "@/utils";

export function StudentDashboardPage() {
  const assignedWordSets = getMockStudentWordSets();
  const averageProgress = getAverage(
    mockStudentClasses.map((classItem) => classItem.progress),
  );

  return (
    <StudentShell
      title="My Word Sets"
      action={
        <Button asChild>
          <Link href="/student/join-class">
            <PlusCircle className="size-4" />
            Join Class
          </Link>
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <section className="grid gap-4 sm:grid-cols-3">
          <SummaryCard icon={Users} label="Classes" value={mockStudentClasses.length} />
          <SummaryCard icon={BookOpen} label="Assigned sets" value={assignedWordSets.length} />
          <SummaryCard icon={Target} label="Average progress" value={`${averageProgress}%`} />
        </section>

        <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {assignedWordSets.map((wordSet) => (
            <Card key={wordSet.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">{wordSet.title}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {wordSet.className}
                    </p>
                  </div>
                  <Badge variant="secondary">{wordSet.dueLabel}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {wordSet.completedWords} of {wordSet.words} words practiced
                  </span>
                  <span className="font-medium text-foreground">
                    {wordSet.progress}%
                  </span>
                </div>
                <Progress value={wordSet.progress} className="h-2" />
                <Button className="w-full" asChild>
                  <Link href={`/student/word-sets/${wordSet.id}/practice`}>
                    Practice
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </StudentShell>
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
