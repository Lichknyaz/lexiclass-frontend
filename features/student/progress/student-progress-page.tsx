"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Target, TrendingDown, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { StudentShell } from "@/components/student/student-shell";
import type { MockStudentProgressWord } from "@/types/mock";
import { getAverage } from "@/utils";

type ProgressWordFilter = "all" | "weak" | "learned";

const progressWordFilterOptions: Array<{
  label: string;
  value: ProgressWordFilter;
}> = [
  { label: "All", value: "all" },
  { label: "Weak", value: "weak" },
  { label: "Learned", value: "learned" },
];

interface StudentProgressPageProps {
  progressWords: MockStudentProgressWord[];
}

export function StudentProgressPage({ progressWords }: StudentProgressPageProps) {
  const [wordFilter, setWordFilter] = useState<ProgressWordFilter>("all");
  const totalWordsPracticed = progressWords.length;
  const correctAnswers = progressWords.reduce(
    (total, word) => total + word.correctCount,
    0,
  );
  const wrongAnswers = progressWords.reduce(
    (total, word) => total + word.wrongCount,
    0,
  );
  const averageMastery = getAverage(
    progressWords.map((word) => word.masteryLevel),
  );
  const weakWords = progressWords.filter(
    (word) => word.masteryLevel < 60,
  );
  const filteredWords = progressWords.filter((word) =>
    matchesProgressWordFilter(word, wordFilter),
  );

  return (
    <StudentShell title="My Progress">
      <div className="flex flex-col gap-4">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={Target}
            label="Total words practiced"
            value={totalWordsPracticed}
          />
          <SummaryCard
            icon={CheckCircle2}
            label="Correct answers"
            value={correctAnswers}
          />
          <SummaryCard
            icon={XCircle}
            label="Wrong answers"
            value={wrongAnswers}
            valueClassName="text-destructive"
          />
          <SummaryCard
            icon={TrendingDown}
            label="Average mastery"
            value={`${averageMastery}%`}
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle>Word Mastery</CardTitle>
              <div className="flex flex-wrap gap-2">
                {progressWordFilterOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    size="sm"
                    variant={wordFilter === option.value ? "default" : "outline"}
                    onClick={() => setWordFilter(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[560px] overflow-auto pr-1">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-card">
                  <TableRow>
                    <TableHead>Word</TableHead>
                    <TableHead>Translation</TableHead>
                    <TableHead>Mastery</TableHead>
                    <TableHead className="text-right">Answers</TableHead>
                    <TableHead>Last practiced</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWords.map((word) => (
                    <TableRow key={word.id}>
                      <TableCell className="font-medium">{word.term}</TableCell>
                      <TableCell>{word.translation}</TableCell>
                      <TableCell className="min-w-40">
                        <WordProgress value={word.masteryLevel} />
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium">{word.correctCount}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          / {word.wrongCount} wrong
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {word.lastPracticedAt}
                      </TableCell>
                    </TableRow>
                  ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weak Words</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 rounded-lg border bg-muted/40 p-4">
                <div className="text-sm text-muted-foreground">
                  Weak words tracked
                </div>
                <div className="mt-1 text-2xl font-semibold">
                  {weakWords.length}
                </div>
              </div>
              <div className="flex max-h-[440px] flex-col gap-3 overflow-auto pr-1">
                {weakWords.map((word) => (
                  <Link
                    key={word.id}
                    href={`/student/word-sets/${word.assignmentId}/practice?mode=weak`}
                    className="rounded-lg border p-3 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{word.term}</div>
                        <div className="text-sm text-muted-foreground">
                          {word.translation}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="shrink-0 border-destructive/30 text-destructive"
                      >
                        {word.masteryLevel}% mastery
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {word.wrongCount}{" "}
                        {pluralize("wrong answer", word.wrongCount)}
                      </span>
                      <span>{word.lastPracticedAt}</span>
                    </div>
                    <Progress
                      value={word.masteryLevel}
                      className="mt-2 h-2 [&_[data-slot=progress-indicator]]:bg-destructive"
                    />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </StudentShell>
  );
}

function pluralize(label: string, count: number) {
  return count === 1 ? label : `${label}s`;
}

function matchesProgressWordFilter(
  word: MockStudentProgressWord,
  filter: ProgressWordFilter,
) {
  if (filter === "weak") {
    return word.masteryLevel < 60;
  }

  if (filter === "learned") {
    return word.masteryLevel >= 80;
  }

  return true;
}

interface SummaryCardProps {
  icon: typeof Target;
  label: string;
  value: number | string;
  valueClassName?: string;
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  valueClassName,
}: SummaryCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="size-4" />
          {label}
        </div>
        <div className={`mt-2 text-2xl font-semibold ${valueClassName ?? ""}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

interface WordProgressProps {
  value: number;
}

function WordProgress({ value }: WordProgressProps) {
  const weak = value < 60;

  return (
    <div className="flex items-center gap-3">
      <Progress
        value={value}
        className={
          weak
            ? "h-2 [&_[data-slot=progress-indicator]]:bg-destructive"
            : "h-2"
        }
      />
      <span
        className={
          weak
            ? "w-10 text-right text-sm font-medium text-destructive"
            : "w-10 text-right text-sm font-medium"
        }
      >
        {value}%
      </span>
    </div>
  );
}
