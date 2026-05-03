"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Play, PlusCircle, Target, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { StudentShell } from "@/components/student/student-shell";
import { getMockStudentWordSets, mockStudentClasses } from "@/mock/mock-data";
import type { MockStudentWordSet } from "@/types/mock";
import { getAverage } from "@/utils";

export function StudentDashboardPage() {
  const assignedWordSets = getMockStudentWordSets();
  const [wordSetFilter, setWordSetFilter] = useState<WordSetFilter>("all");
  const [detailsWordSet, setDetailsWordSet] =
    useState<MockStudentWordSet | null>(null);
  const averageProgress = getAverage(
    mockStudentClasses.map((classItem) => classItem.progress),
  );
  const continueWordSet = useMemo(
    () => getContinueWordSet(assignedWordSets),
    [assignedWordSets],
  );
  const filteredWordSets = useMemo(
    () =>
      assignedWordSets.filter((wordSet) =>
        matchesWordSetFilter(wordSet, wordSetFilter),
      ),
    [assignedWordSets, wordSetFilter],
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
        {continueWordSet && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>Continue Learning</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {continueWordSet.title} · {continueWordSet.className}
                  </p>
                </div>
                <Badge variant="secondary">{continueWordSet.dueLabel}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {continueWordSet.words - continueWordSet.completedWords} words
                  left
                </span>
                <span className="font-medium text-foreground">
                  {continueWordSet.progress}%
                </span>
              </div>
              <Progress value={continueWordSet.progress} className="h-2" />
              <Button className="w-full sm:w-fit" asChild>
                <Link href={`/student/word-sets/${continueWordSet.id}/practice`}>
                  <Play className="size-4" />
                  Continue Practice
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <section className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={Users}
            label="Classes"
            value={mockStudentClasses.length}
          />
          <SummaryCard
            icon={BookOpen}
            label="Assigned sets"
            value={assignedWordSets.length}
          />
          <SummaryCard
            icon={Target}
            label="Average progress"
            value={`${averageProgress}%`}
          />
        </section>

        <div className="flex flex-wrap gap-2">
          {wordSetFilterOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={wordSetFilter === option.value ? "default" : "outline"}
              onClick={() => setWordSetFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filteredWordSets.map((wordSet) => (
            <Card
              key={wordSet.id}
              className="transition-shadow hover:shadow-md"
            >
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
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    variant="outline"
                    onClick={() => setDetailsWordSet(wordSet)}
                  >
                    View details
                  </Button>
                  <Button asChild>
                    <Link href={`/student/word-sets/${wordSet.id}/practice`}>
                      Practice
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>

      <WordSetDetailsDialog
        wordSet={detailsWordSet}
        onOpenChange={(open) => {
          if (!open) {
            setDetailsWordSet(null);
          }
        }}
      />
    </StudentShell>
  );
}

type WordSetFilter = "all" | "due-today" | "completed" | "weak";

const wordSetFilterOptions: Array<{ label: string; value: WordSetFilter }> = [
  { label: "All", value: "all" },
  { label: "Due today", value: "due-today" },
  { label: "Completed", value: "completed" },
  { label: "Weak", value: "weak" },
];

function getContinueWordSet(wordSets: MockStudentWordSet[]) {
  return [...wordSets]
    .filter((wordSet) => wordSet.completedWords < wordSet.words)
    .sort((a, b) => {
      const aDueToday = isDueToday(a) ? 1 : 0;
      const bDueToday = isDueToday(b) ? 1 : 0;

      if (aDueToday !== bDueToday) {
        return bDueToday - aDueToday;
      }

      return a.progress - b.progress;
    })[0];
}

function matchesWordSetFilter(
  wordSet: MockStudentWordSet,
  filter: WordSetFilter,
) {
  if (filter === "due-today") {
    return isDueToday(wordSet);
  }

  if (filter === "completed") {
    return wordSet.completedWords >= wordSet.words || wordSet.progress >= 100;
  }

  if (filter === "weak") {
    return wordSet.progress < 60;
  }

  return true;
}

function isDueToday(wordSet: MockStudentWordSet) {
  return wordSet.dueLabel.toLowerCase().includes("today");
}

function WordSetDetailsDialog({
  wordSet,
  onOpenChange,
}: {
  wordSet: MockStudentWordSet | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={Boolean(wordSet)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{wordSet?.title ?? "Word set details"}</DialogTitle>
          <DialogDescription>{wordSet?.className}</DialogDescription>
        </DialogHeader>

        {wordSet && (
          <div className="grid gap-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {wordSet.completedWords} of {wordSet.words} words practiced
              </span>
              <span className="font-medium text-foreground">
                {wordSet.progress}%
              </span>
            </div>
            <Progress value={wordSet.progress} className="h-2" />
            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryCard
                icon={BookOpen}
                label="Words left"
                value={wordSet.words - wordSet.completedWords}
              />
              <SummaryCard
                icon={Target}
                label="Status"
                value={wordSet.dueLabel}
              />
            </div>
            <Button asChild>
              <Link href={`/student/word-sets/${wordSet.id}/practice`}>
                Continue Practice
              </Link>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
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
